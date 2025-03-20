const connectDB = require("../db");
const { ObjectId } = require("mongodb");

let db;
connectDB().then(database => db = database);

/**
 * Get all events assigned to a volunteer
 */
const getAssignments = async (req, res) => {
  const volunteerId = req.query.volunteerId;
  
  if (!volunteerId) {
    return res.status(400).json({ message: "Volunteer ID is required" });
  }
  
  try {
    // Validate the volunteer ID format
    let objectId;
    try {
      objectId = new ObjectId(volunteerId);
    } catch (error) {
      return res.status(400).json({ message: "Invalid volunteer ID format" });
    }
    
    const eventsCollection = db.collection("events");
    const volunteersCollection = db.collection("users");
    
    // Check if the volunteer exists
    const volunteer = await volunteersCollection.findOne({ _id: objectId });
    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer not found" });
    }
    
    // Find all events where this volunteer ID exists in the volunteers array
    const assignedEvents = await eventsCollection.find({
      volunteers: volunteerId
    }).toArray();
    
    if (assignedEvents.length === 0) {
      return res.status(404).json({ message: "No events found for this volunteer." });
    }
    
    // Format the response to include the "volunteered" flag
    const formattedEvents = assignedEvents.map(event => ({
      ...event,
      volunteered: true // Since we're only getting events they volunteered for
    }));
    
    res.json(formattedEvents);
  } catch (error) {
    console.error("Error retrieving volunteer events:", error);
    res.status(500).json({ message: "Error retrieving volunteer events", error: error.message });
  }
};

/**
 * Assign a volunteer to an event based on matching criteria
 */
const assignVolunteer = async (req, res) => {
  const hardcodedVolunteerId = "67dc7711789abd6590688cf4";
  
  try {
    if (!hardcodedVolunteerId) {
      return res.status(400).json({ message: "Volunteer ID is required" });
    }
    
    // Validate the volunteer ID format
    let objectId;
    try {
      objectId = new ObjectId(hardcodedVolunteerId);
    } catch (error) {
      return res.status(400).json({ message: "Invalid volunteer ID format" });
    }
    
    const volunteersCollection = db.collection("users");
    const eventsCollection = db.collection("events");
    
    // Check if the volunteer exists
    const volunteer = await volunteersCollection.findOne({ _id: objectId });
    if (!volunteer) {
      console.error('Error: Volunteer not found in DB');
      return res.status(404).json({ message: "Volunteer not found" });
    }
    
    console.log('Volunteer found:', volunteer);
    
    // Debug: Check if required fields exist
    if (!volunteer.zipCode || !volunteer.skills || !volunteer.availability) {
      console.error('Error: Missing required fields in volunteer object', volunteer);
      return res.status(400).json({ message: "Volunteer data is incomplete" });
    }
    
    // Find a matching event
    const matchingEvent = await eventsCollection.findOne({
      zipCode: volunteer.zipCode,
      skills: { $in: volunteer.skills },
      date: volunteer.availability
    });
    
    if (!matchingEvent) {
      console.error('Error: No matching event found');
      return res.status(404).json({ message: "No suitable event found" });
    }
    
    console.log('Matching Event Found:', matchingEvent);
    
    // Check if volunteer is already assigned
    if (matchingEvent.volunteers && matchingEvent.volunteers.includes(hardcodedVolunteerId)) {
      console.error('Error: Volunteer already assigned to event');
      return res.status(400).json({ message: "Volunteer already assigned to this event" });
    }
    
    // Initialize volunteers array if it doesn't exist
    if (!matchingEvent.volunteers) {
      matchingEvent.volunteers = [];
    }
    
    // Assign the volunteer
    await eventsCollection.updateOne(
      { _id: matchingEvent._id },
      { $push: { volunteers: hardcodedVolunteerId } }
    );
    
    console.log('Volunteer assigned successfully:', hardcodedVolunteerId);
    
    // Get the updated event
    const updatedEvent = await eventsCollection.findOne({ _id: matchingEvent._id });
    res.status(200).json({ 
      message: "Volunteer assigned successfully", 
      event: {
        ...updatedEvent,
        volunteered: true
      }
    });
    
  } catch (error) {
    console.error('Error in assignVolunteer:', error);
    res.status(500).json({ message: "Error assigning volunteer", error: error.message });
  }
};

module.exports = {
  getAssignments,
  assignVolunteer
};