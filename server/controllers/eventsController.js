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

const getAllVolunteers = async (req, res) => {
  try {
    const eventsCollection = db.collection("events");
    const volunteersCollection = db.collection("volunteers");

    // Fetch all events
    const allEvents = await eventsCollection.find({}).toArray();

    // Extract unique volunteer IDs from all events
    let volunteerIds = new Set();
    allEvents.forEach(event => {
      (event.volunteers || []).forEach(volunteerId => {
        if (typeof volunteerId === "string") {
          volunteerIds.add(volunteerId);
        }
      });
    });

    // Convert Set to Array
    const volunteerIdArray = Array.from(volunteerIds);

    // Fetch full volunteer details from the `volunteers` collection
    const volunteers = await volunteersCollection
      .find({ _id: { $in: volunteerIdArray.map(id => new ObjectId(id)) } })
      .toArray();

    // Create a lookup map for volunteers
    const volunteerMap = {};
    volunteers.forEach(vol => {
      volunteerMap[vol._id.toString()] = {
        id: vol._id.toString(),
        firstName: vol.firstName,
        lastName: vol.lastName,
        email: vol.email
      };
    });

    // Map the volunteers to their respective events
    let allVolunteers = [];
    allEvents.forEach(event => {
      (event.volunteers || []).forEach(volunteerId => {
        if (volunteerMap[volunteerId]) {
          allVolunteers.push({
            id: volunteerId,
            firstName: volunteerMap[volunteerId].firstName,
            lastName: volunteerMap[volunteerId].lastName,
            email: volunteerMap[volunteerId].email,
            eventName: event.name
          });
        }
      });
    });

    res.json(allVolunteers);
  } catch (error) {
    console.error("Error retrieving all volunteers:", error);
    res.status(500).json({ message: "Error retrieving all volunteers", error: error.message });
  }
};



const addVolunteerToEvent = async (req, res) => {
  const { eventId, volunteerId, sourceEventId } = req.body;

  try {
    const eventsCollection = db.collection("events");
    
    // If sourceEventId is provided, we need to remove the volunteer from there first
    if (sourceEventId) {
      await eventsCollection.updateOne(
        { _id: new ObjectId(sourceEventId) },
        { $pull: { volunteers: volunteerId } }
      );
    }

    // Add volunteer to the target event
    await eventsCollection.updateOne(
      { _id: new ObjectId(eventId) },
      { $push: { volunteers: volunteerId } }
    );

    res.status(201).json({ volunteerId });
  } catch (error) {
    console.error("Error managing volunteer:", error);
    res.status(500).json({ message: "Error managing volunteer", error });
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
    const volunteersCollection = db.collection("volunteers");
    
    // First, check if the volunteer exists
    const volunteer = await volunteersCollection.findOne({ _id: objectId });
    if (!volunteer) {
      return res.status(404).json({ message: "Volunteer not found" });
    }
    
    // Find all events where this volunteer ID exists in the volunteers array
    const events = await eventsCollection.find({ 
      volunteers: volunteerId 
    }).toArray();
    
    // Format the response to include the "volunteered" flag
    const formattedEvents = events.map(event => ({
      ...event,
      volunteered: true // Since we're only getting events they volunteered for
    }));
    
    res.json(formattedEvents);
  } catch (error) {
    console.error("Error retrieving volunteer events:", error);
    res.status(500).json({ message: "Error retrieving volunteer events", error: error.message });
  }
};

module.exports = {
  getVolunteerHistory,
  addEvent,
  getEvents,
  getVolunteers,
  addVolunteerToEvent,
  updateEvent,
  getAllVolunteers,
  getEventsByVolunteerId
};
