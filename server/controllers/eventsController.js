const connectDB = require("../db");
const { ObjectId } = require("mongodb");

let db;
connectDB().then(database => db = database); 

// Fetch all events
const getVolunteerHistory = async (req, res) => {
  try {
    const eventsCollection = db.collection("events");
    const events = await eventsCollection.find({}).toArray();
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving events", error });
  }
};

// Add a new event 
const addEvent = async (req, res) => {
  const { name, date, city, state, address, status, description, skills } = req.body;

  if (!name || !date || !city || !state || !address || !status || !description) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const newEvent = {
    name,
    date,
    city,
    state,
    address,
    status,
    description,
    skills: skills || [],
    volunteers: []
  };

  try {
    const eventsCollection = db.collection("events");
    const result = await eventsCollection.insertOne(newEvent);
    res.status(201).json({ ...newEvent, _id: result.insertedId });
  } catch (error) {
    res.status(500).json({ message: "Error adding event", error });
  }
};




const updateEvent = async (req, res) => {
  const eventId = req.params.id;
  
  try {
    const eventsCollection = db.collection("events");
    
    // First, validate that the ID is a valid ObjectId
    let objectId;
    try {
      objectId = new ObjectId(eventId);
    } catch (error) {
      return res.status(400).json({ message: "Invalid event ID format" });
    }
    
    // The issue might be here - MongoDB Node.js driver v4+ changed findOneAndUpdate behavior
    // Let's fix this to return the correct response format
    const result = await eventsCollection.findOneAndUpdate(
      { _id: objectId },
      { $set: req.body },
      { returnDocument: "after" }
    );
    
    if (!result) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    res.json(result);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Error updating event", error: error.message });
  }
};

// Fetch upcoming events 
const getEvents = async (req, res) => {
  try {
    const eventsCollection = db.collection("events");
    const upcomingEvents = await eventsCollection.find({ status: "Upcoming" }).toArray();
    const eventNames = upcomingEvents.map(event => event.name);
    res.json(eventNames);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving upcoming events", error });
  }
};

// Get all volunteers 
const getVolunteers = async (req, res) => {
  try {
    const eventsCollection = db.collection("events");
    const allEvents = await eventsCollection.find({}).toArray();
    let allVolunteers = allEvents.flatMap(event =>
      event.volunteers.map(volunteer => ({
        eventName: event.name,
        ...volunteer
      }))
    );
    res.json(allVolunteers);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving volunteers", error });
  }
};

// Add a volunteer to an event 
const addVolunteerToEvent = async (req, res) => {
  const { eventId, volunteerName, volunteerEmail } = req.body;

  try {
    const eventsCollection = db.collection("events");
    const event = await eventsCollection.findOne({ _id: new require("mongodb").ObjectId(eventId) });

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const newVolunteer = {
      id: `volunteer-${event.volunteers.length + 1}`,
      name: volunteerName,
      email: volunteerEmail
    };

    await eventsCollection.updateOne(
      { _id: new require("mongodb").ObjectId(eventId) },
      { $push: { volunteers: newVolunteer } }
    );

    res.status(201).json(newVolunteer);
  } catch (error) {
    res.status(500).json({ message: "Error adding volunteer", error });
  }
};

module.exports = {
  getVolunteerHistory,
  addEvent,
  getEvents,
  getVolunteers,
  addVolunteerToEvent,
  updateEvent
};
