const connectDB = require("../db");
const { ObjectId } = require("mongodb");

let db;
connectDB().then((database) => (db = database));

const getUpcomingEventsByVolunteerId = async (req, res) => {
  const volunteerId = req.params.id;

  try {
    const eventsCollection = db.collection("events");

    // Find upcoming events where this volunteer ID exists in the volunteers array
    const upcomingEvents = await eventsCollection
      .find({
        volunteers: volunteerId,
        status: "Upcoming",
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

module.exports = {
  getEventsByVolunteerId,
  getUpcomingEventsByVolunteerId,
};
