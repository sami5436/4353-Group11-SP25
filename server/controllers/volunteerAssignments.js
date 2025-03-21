const connectDB = require("../db");
const { ObjectId } = require("mongodb");

let dbPromise = connectDB(); 

const getAssignments = async (req, res) => {
  const volunteerId = req.query.volunteerId;

  if (!volunteerId) {
    return res.status(400).json({ error: "Volunteer ID is required" });
  }

  try {
    let objectId;
    try {
      objectId = new ObjectId(volunteerId);
    } catch (error) {
      return res.status(400).json({ error: "Invalid volunteer ID format" });
    }

    const { db } = await dbPromise;
    const eventsCollection = db.collection("events");
    const volunteersCollection = db.collection("users");

    const volunteer = await volunteersCollection.findOne({ _id: objectId });
    if (!volunteer) {
      return res.status(404).json({ error: "Volunteer not found" });
    }

    const assignedEvents = await eventsCollection.find({
      volunteers: volunteerId
    }).toArray();

    if (assignedEvents.length === 0) {
      return res.status(404).json({ error: "No events found for this volunteer." });
    }

    const formattedEvents = assignedEvents.map(event => ({
      ...event,
      volunteered: true
    }));

    res.json(formattedEvents);
  } catch (error) {
    console.error("Error retrieving volunteer events:", error);
    res.status(500).json({ error: "Error retrieving volunteer events", details: error.message });
  }
};

const assignVolunteer = async (req, res) => {
  const volunteerId = req.params.id;
  const fallbackEventId = "67dce403deb657df9900d5a7";

  try {
    let objectId;
    try {
      objectId = new ObjectId(volunteerId);
      console.log("here!!")
    } catch (error) {
      console.log(" no good here!!")

      return res.status(400).json({ error: "Invalid volunteer ID format" });
    }

    const db = await dbPromise;
    const volunteersCollection = db.collection("users");
    const eventsCollection = db.collection("events");

    const volunteer = await volunteersCollection.findOne({ _id: objectId });
    if (!volunteer) {
      return res.status(404).json({ error: "Volunteer not found" });
    }

    if (!volunteer.zipCode1 || !volunteer.skills || !volunteer.availability) {
      return res.status(400).json({ error: "Volunteer data is incomplete" });
    }

    // Try to find a matching event
    let matchingEvent = await eventsCollection.findOne({
      zipCode: volunteer.zipCode1,
      skills: { $in: volunteer.skills },
      date: { $in: volunteer.availability }
    });

    let assignedToFallback = false;

    // If no matching event, assign to fallback
    if (!matchingEvent) {
      assignedToFallback = true;
      matchingEvent = await eventsCollection.findOne({ _id: new ObjectId(fallbackEventId) });

      if (!matchingEvent) {
        return res.status(404).json({ error: "Fallback event not found" });
      }
    }

    // Prevent duplicate assignment
    if (matchingEvent.volunteers?.includes(volunteerId)) {
      return res.status(400).json({ error: "Volunteer already assigned to this event" });
    }

    // Add volunteer to event
    await eventsCollection.updateOne(
      { _id: matchingEvent._id },
      { $push: { volunteers: volunteerId } }
    );

    const updatedEvent = await eventsCollection.findOne({ _id: matchingEvent._id });

    res.status(200).json({
      message: `Volunteer assigned ${assignedToFallback ? "to fallback event" : "successfully"}`,
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
  getAssignments,
  assignVolunteer
};