const connectDB = require("../db");
const { ObjectId } = require("mongodb");

let db;
connectDB().then((database) => (db = database));

const getVolunteerById = async (req, res) => {
  const volunteerId = req.params.id;

  try{
    const usersCollection = db.collection("users");
    const getAllVolunteers = await usersCollection
      .find({
        volunteers: volunteerId
      })
      .toArray();





  } catch(error){
    console.error("Error retrieving volunteer data:", error);
    res.status(500).json({
      message: "Error retrieving volunteer data",
      error: error.message,
    });


  }

}
const getUpcomingEventsByVolunteerId = async (req, res) => {
  const volunteerId = req.params.id;
  const manualAssignmentEventId = "67deab0b0f1bbc40a5d44d61"; // The ID of the event to exclude

  try {
    const eventsCollection = db.collection("events");

    // Find upcoming events where this volunteer ID exists in the volunteers array
    // But exclude the manual assignment event
    const upcomingEvents = await eventsCollection
      .find({
        volunteers: volunteerId,
        status: "Upcoming",
        _id: { $ne: new ObjectId(manualAssignmentEventId) } // Exclude manual assignment event
      })
      .toArray();

    // Format the response
    const formattedEvents = upcomingEvents.map((event) => ({
      ...event,
      volunteered: true, // Since we're only getting events they're part of
    }));

    res.json(formattedEvents);
  } catch (error) {
    console.error("Error retrieving upcoming volunteer events:", error);
    res.status(500).json({
      message: "Error retrieving upcoming events",
      error: error.message,
    });
  }
};

const getEventsByVolunteerId = async (req, res) => {
  const volunteerId = req.params.id;
  const manualAssignmentEventId = "67deab0b0f1bbc40a5d44d61"; // The ID of the event to exclude

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

    const events = await eventsCollection
      .find({
        volunteers: volunteerId,
        _id: { $ne: new ObjectId(manualAssignmentEventId) } // Exclude manual assignment event
      })
      .toArray();

    if (events.length === 0) {
      return res
        .status(404)
        .json({ error: "No events found for this volunteer" });
    }

    // Format the response to include the "volunteered" flag
    const formattedEvents = events.map((event) => ({
      ...event,
      volunteered: true, // Since we're only getting events they volunteered for
    }));

    res.json(formattedEvents);
  } catch (error) {
    console.error("Error retrieving volunteer events:", error);
    res.status(500).json({
      message: "Error retrieving volunteer events",
      error: error.message,
    });
  }
};

/**
 * Removes a volunteer from an event
 * @param {Object} req - Request object with event ID and volunteer ID
 * @param {Object} res - Response object
 */
const removeVolunteerFromEvent = async (req, res) => {
  const { eventId, volunteerId } = req.params;

  try {
    // Validate IDs
    let eventObjectId;
    
    try {
      eventObjectId = new ObjectId(eventId);
    } catch (error) {
      return res.status(400).json({ message: "Invalid event ID format" });
    }
    
    const eventsCollection = db.collection("events");
    
    const event = await eventsCollection.findOne({ _id: eventObjectId });
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    if (!event.volunteers || !event.volunteers.includes(volunteerId)) {
      return res.status(400).json({ 
        message: "Volunteer is not assigned to this event" 
      });
    }

    // Remove volunteer from the volunteers array
    // AND add them to the removed array (create it if it doesn't exist)
    const result = await eventsCollection.updateOne(
      { _id: eventObjectId },
      { 
        $pull: { volunteers: volunteerId },
        $addToSet: { removed: volunteerId } // Creates the array if it doesn't exist
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ 
        message: "Failed to remove volunteer from event" 
      });
    }

    res.status(200).json({ 
      message: "Volunteer successfully removed from event",
      eventId,
      volunteerId
    });
  } catch (error) {
    console.error("Error removing volunteer from event:", error);
    res.status(500).json({
      message: "Server error while removing volunteer from event",
      error: error.message,
    });
  }
};

module.exports = {
  getEventsByVolunteerId,
  getUpcomingEventsByVolunteerId,
  removeVolunteerFromEvent,
  getVolunteerById
};