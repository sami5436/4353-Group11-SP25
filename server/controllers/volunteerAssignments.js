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
    
    const availableEvents = allEvents.filter(event => {
      const eventVolunteers = event.volunteers || [];
      return !eventVolunteers.includes(volunteerId);
    });
    
    const scoredEvents = availableEvents.map(event => {
      let score = 0;
      
      if (event.zipCode === volunteer.zipCode1) {
        score += 1;
      }
      
      const eventSkills = event.skills || [];
      const volunteerSkills = volunteer.skills || [];
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
    
    if (scoredEvents.length > 1) {
      const bestMatch = scoredEvents[0];
      console.log(`Best match: ${bestMatch.event.name} with score ${bestMatch.score}`);
      console.log(`Match details: ${JSON.stringify(bestMatch.matches)}`);
    }
    
    // Assign to the best match if it has at least 1 matching criterion
    let matchingEvent = null;
    let assignedToFallback = false;
    
    if (scoredEvents.length > 0 && scoredEvents[0].score >= 1) {
      matchingEvent = scoredEvents[0].event;
      console.log("Found matching event with score:", scoredEvents[0].score);
    } else {
      // Use fallback if no good match
      assignedToFallback = true;
      matchingEvent = await eventsCollection.findOne({ _id: new ObjectId(fallbackEventId) });
      console.log("No good match found, using fallback event");
      
      if (!matchingEvent) {
        return res.status(404).json({ error: "Fallback event not found" });
      }
    }
    
    // Add volunteer to event
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
      notificationType: "new_event"
    };

    await notificationsCollection.insertOne(newEventNotification);
    
    const updatedEvent = await eventsCollection.findOne({ _id: matchingEvent._id });
    
    res.status(200).json({
      message: `Volunteer assigned ${assignedToFallback ? "to fallback event" : "successfully"}`,
      matchScore: assignedToFallback ? 0 : scoredEvents[0].score,
      matchDetails: assignedToFallback ? null : scoredEvents[0].matches,
      event: {
        ...updatedEvent,
        volunteered: true
      }
    });
  } catch (error) {
    console.error("Error in assignVolunteer:", error);
    res.status(500).json({ error: "Error assigning volunteer", details: error.message });
  }
};

module.exports = {
  assignVolunteer
};