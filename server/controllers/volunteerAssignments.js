const connectDB = require("../db");
const { ObjectId } = require("mongodb");

const assignVolunteer = async (req, res) => {
  const volunteerId = req.params.id;
  const fallbackEventId = "67deab0b0f1bbc40a5d44d61";
  
  try {
    let objectId;
    try {
      objectId = new ObjectId(volunteerId);
      console.log("Valid volunteer ID format");
    } catch (error) {
      console.log("Invalid volunteer ID format");
      return res.status(400).json({ error: "Invalid volunteer ID format" });
    }
    
    const db = await connectDB();
    const volunteersCollection = db.collection("users");
    const eventsCollection = db.collection("events");
    
    const volunteer = await volunteersCollection.findOne({ _id: objectId });
    if (!volunteer) {
      return res.status(404).json({ error: "Volunteer not found" });
    }
    
    if (!volunteer.zipCode1 || !volunteer.skills || !volunteer.availability) {
      return res.status(400).json({ error: "Volunteer data is incomplete" });
    }

    console.log("Volunteer data:", {
      id: volunteerId,
      zipCode: volunteer.zipCode1,
      skills: volunteer.skills,
      availability: volunteer.availability
    });
    
    const allEvents = await eventsCollection.find({}).toArray();
    
    // Get events the volunteer is already assigned to
    const assignedEvents = allEvents.filter(event => {
      const eventVolunteers = event.volunteers || [];
      return eventVolunteers.includes(volunteerId);
    });
    
    // Check if volunteer is in the fallback event
    const isInFallbackEvent = assignedEvents.some(event => 
      event._id.toString() === fallbackEventId
    );
    
    // Get events the volunteer is not assigned to yet AND hasn't removed themselves from
    const availableEvents = allEvents.filter(event => {
      const eventVolunteers = event.volunteers || [];
      const removedVolunteers = event.removed || [];
      
      // Event is available if volunteer is not assigned AND hasn't removed themselves
      return !eventVolunteers.includes(volunteerId) && !removedVolunteers.includes(volunteerId);
    });
    
    const scoredEvents = availableEvents.map(event => {
      let score = 0;
      
      if (event.zipCode === volunteer.zipCode1) {
        score += 1;
      }
      
      const eventSkills = (event.skills || []).map(skill => skill.toLowerCase());
      const volunteerSkills = (volunteer.skills || []).map(skill => skill.toLowerCase());
      
      const hasMatchingSkill = volunteerSkills.some(skill => 
        eventSkills.includes(skill)
      );
      if (hasMatchingSkill) {
        score += 1;
      }
      
      const eventDates = Array.isArray(event.date) ? event.date : [event.date];
      const volunteerDates = volunteer.availability || [];
      
      const hasMatchingDate = volunteerDates.some(volunteerDate => {
        const volunteerDateStr = volunteerDate instanceof Date 
          ? volunteerDate.toISOString().split('T')[0] 
          : volunteerDate;
          
        return eventDates.some(eventDate => {
          const eventDateStr = eventDate instanceof Date 
            ? eventDate.toISOString().split('T')[0] 
            : eventDate;
          
          return eventDateStr === volunteerDateStr;
        });
      });
      
      if (hasMatchingDate) {
        score += 1;
      }
      
      return {
        event,
        score,
        matches: {
          zipCode: event.zipCode === volunteer.zipCode1,
          skills: hasMatchingSkill,
          dates: hasMatchingDate
        }
      };
    });
    
    scoredEvents.sort((a, b) => b.score - a.score);
    
    console.log("Top 3 matching events:", scoredEvents.slice(0, 3).map(e => ({
      name: e.event.name,
      score: e.score,
      matches: e.matches
    })));
    
    // Get all events with a score of 2 or higher
    const goodMatches = scoredEvents.filter(scored => scored.score >= 2);
    
    if (goodMatches.length > 0) {
      console.log(`Found ${goodMatches.length} good matches with score >= 2`);
      
      // If volunteer is in fallback event, remove them from it
      if (isInFallbackEvent) {
        await eventsCollection.updateOne(
          { _id: new ObjectId(fallbackEventId) },
          { $pull: { volunteers: volunteerId } }
        );
        console.log("Removed volunteer from fallback event after good match found");
      }
      
      const notificationsCollection = db.collection("notifications");
      const assignedEventsData = [];
      
      // Assign volunteer to all good matches
      for (const match of goodMatches) {
        const matchingEvent = match.event;
        
        // Check if volunteer is already assigned to this specific event
        const isAlreadyAssignedToThisEvent = assignedEvents.some(event => 
          event._id.toString() === matchingEvent._id.toString()
        );
        
        if (!isAlreadyAssignedToThisEvent) {
          // Add volunteer to the matching event
          await eventsCollection.updateOne(
            { _id: matchingEvent._id },
            { $push: { volunteers: volunteerId } }
          );
          
          // Create notification for this event assignment
          const newEventNotification = {
            recipientId: volunteerId,
            recipientType: "volunteer",
            message: `New Event Assigned: ${matchingEvent.name}`,
            timestamp: new Date(),
            read: false,
            details: `You have been assigned to the event "${matchingEvent.name}". Please check your schedule and event details.`,
            notificationType: "new_event",
            metadata: {
              eventId: matchingEvent._id.toString()
            }
          };
          
          await notificationsCollection.insertOne(newEventNotification);
          
          // Get updated event details with the volunteer added
          const updatedEvent = await eventsCollection.findOne({ _id: matchingEvent._id });
          assignedEventsData.push({
            ...updatedEvent,
            volunteered: true,
            matchScore: match.score,
            matchDetails: match.matches
          });
        }
      }
      
      res.status(200).json({
        message: `Volunteer assigned to ${assignedEventsData.length} events successfully`,
        events: assignedEventsData,
        removedFromFallback: isInFallbackEvent
      });
    } else {
      // Special case: Check if fallback event is in the "removed" list for this volunteer
      let fallbackEventRemoved = false;
      const fallbackEvent = await eventsCollection.findOne({ _id: new ObjectId(fallbackEventId) });
      if (fallbackEvent) {
        const removedVolunteers = fallbackEvent.removed || [];
        fallbackEventRemoved = removedVolunteers.includes(volunteerId);
      }
      
      // If no good match found and volunteer isn't already in fallback and hasn't removed themselves from fallback
      if (!isInFallbackEvent && !fallbackEventRemoved) {
        // Use fallback event
        const matchingEvent = fallbackEvent;
        console.log("No good match found, using fallback event");
        
        if (!matchingEvent) {
          return res.status(404).json({ error: "Fallback event not found" });
        }
        
        // Add volunteer to fallback event
        await eventsCollection.updateOne(
          { _id: matchingEvent._id },
          { $push: { volunteers: volunteerId } }
        );
        
        const notificationsCollection = db.collection("notifications");
        
        const newEventNotification = {
          recipientId: volunteerId,
          recipientType: "volunteer",
          message: `New Event Assigned: ${matchingEvent.name}`,
          timestamp: new Date(),
          read: false,
          details: `You have been assigned to the event "${matchingEvent.name}". Please check your schedule and event details.`,
          notificationType: "new_event",
          metadata: {
            eventId: matchingEvent._id.toString()
          }
        };
        
        await notificationsCollection.insertOne(newEventNotification);
        
        const updatedEvent = await eventsCollection.findOne({ _id: matchingEvent._id });
        
        res.status(200).json({
          message: "Volunteer assigned to fallback event",
          events: [{
            ...updatedEvent,
            volunteered: true,
            matchScore: 0,
            matchDetails: null
          }]
        });
      } else if (isInFallbackEvent) {
        // Volunteer is already in fallback event and no good match found
        res.status(200).json({
          message: "Volunteer already assigned to fallback event, no better match found",
          events: [{
            ...fallbackEvent,
            volunteered: true,
            matchScore: 0,
            matchDetails: null
          }]
        });
      } else {
        // Volunteer has removed themselves from the fallback event and no good match found
        res.status(200).json({
          message: "No suitable events found and volunteer has opted out of the default event",
          noAssignment: true,
          events: []
        });
      }
    }
  } catch (error) {
    console.error("Error in assignVolunteer:", error);
    res.status(500).json({ error: "Error assigning volunteer", details: error.message });
  }
};

module.exports = {
  assignVolunteer
};