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
  const { name, date, city, state, zipCode, address, status, description, skills } = req.body;
  const userId = req.cookies.userId;

  if (!name || !date || !city || !state || !zipCode || !address || !status || !description) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: Admin ID not found" });
  }

  const newEvent = {
    name,
    date,
    city,
    state,
    zipCode,
    address,
    status,
    description,
    skills: skills || [],
    volunteers: [],
    createdBy: userId
  };

  try {
    const eventsCollection = db.collection("events");
    const notificationsCollection = db.collection("notifications");

    const result = await eventsCollection.insertOne(newEvent);

    const notification = {
      recipientId: userId, 
      recipientType: "admin",
      message: `New Event Created: ${name}`,
      timestamp: new Date(),
      read: false,
      details: `Event Details: ${name} on ${date} in ${city}, ${state} \n ${description}`,
      notificationType: "event_creation"
    };

    await notificationsCollection.insertOne(notification);

    res.status(201).json({ 
      ...newEvent, 
      _id: result.insertedId,
      notificationCreated: true 
    });
  } catch (error) {
    console.error("Error adding event:", error);
    res.status(500).json({ message: "Error adding event", error });
  }
};



const updateEvent = async (req, res) => {
  const eventId = req.params.id;
  const userId = req.cookies.userId; 

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: No user ID found" });
  }
  
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "Request body cannot be empty" });
  }

  if (req.body.name !== undefined && req.body.name.trim() === '') {
    return res.status(400).json({ message: "Name cannot be empty" });
  }

  if (req.body.status !== undefined && 
     !['Upcoming', 'Completed', 'Cancelled'].includes(req.body.status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }
  
  try {
    const eventsCollection = db.collection("events");
    const notificationsCollection = db.collection("notifications");
    
    let objectId;
    try {
      objectId = new ObjectId(eventId);
    } catch (error) {
      return res.status(400).json({ message: "Invalid event ID format" });
    }
    
    const originalEvent = await eventsCollection.findOne({ _id: objectId });
    
    if (!originalEvent) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    const result = await eventsCollection.findOneAndUpdate(
      { _id: objectId },
      { $set: req.body },
      { returnDocument: "after" }
    );
    
    if (!result) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    const updatedFields = [];
    for (const [key, value] of Object.entries(req.body)) {
      if (JSON.stringify(originalEvent[key]) !== JSON.stringify(value)) {
        updatedFields.push(key);
      }
    }
    
    const changes = updatedFields.map(field => {
      if (field === 'date') {
        return `Date changed from ${originalEvent.date} to ${req.body.date}`;
      } else if (field === 'status') {
        return `Status updated from ${originalEvent.status} to ${req.body.status}`;
      } else if (field === 'skills') {
        return 'Required skills have been updated';
      } else if (field === 'description') {
        return 'Event description has been updated';
      } else {
        return `${field.charAt(0).toUpperCase() + field.slice(1)} has been updated`;
      }
    }).join(', ');
    
    if (updatedFields.length > 0) {
      const adminNotification = {
        recipientId: userId,
        recipientType: "admin",
        message: `Event Updated: ${result.name}`,
        timestamp: new Date(),
        read: false,
        details: `The following changes were made to ${result.name}:\n${changes}`,
        notificationType: "event_update"
      };
      
      await notificationsCollection.insertOne(adminNotification);
      
      if (originalEvent.volunteers && originalEvent.volunteers.length > 0) {
        const bulkNotifications = originalEvent.volunteers.map(volunteerId => ({
          recipientId: volunteerId,
          recipientType: "volunteer",
          message: `Event Update: ${result.name}`,
          timestamp: new Date(),
          read: false,
          details: `The event "${result.name}" you signed up for has been updated:\n${changes}`,
          notificationType: "event_update"
        }));
        
        if (bulkNotifications.length > 0) {
          await notificationsCollection.insertMany(bulkNotifications);
        }
      }
    }
    
    res.json({
      ...result,
      notificationsCreated: updatedFields.length > 0
    });
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
    const volunteersCollection = db.collection("users");

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
  const { eventId, volunteerId, volunteerName, volunteerEmail, sourceEventId } = req.body;

  if (!eventId || (!volunteerId && (!volunteerName || !volunteerEmail))) {
    return res.status(400).json({ message: "Required fields are missing" });
  }

  try {
    const eventsCollection = db.collection("events");
    
    // Check if the event exists first
    const eventExists = await eventsCollection.findOne({ _id: new ObjectId(eventId) });
    if (!eventExists) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    // If sourceEventId is provided, we need to remove the volunteer from there first
    if (sourceEventId) {
      await eventsCollection.updateOne(
        { _id: new ObjectId(sourceEventId) },
        { $pull: { volunteers: volunteerId } }
      );
    }

    // Create volunteer object if name/email provided
    const volunteer = volunteerId ? volunteerId : { 
      name: volunteerName, 
      email: volunteerEmail,
      id: new ObjectId().toString()
    };

    // Add volunteer to the target event
    await eventsCollection.updateOne(
      { _id: new ObjectId(eventId) },
      { $push: { volunteers: volunteerId || volunteer } }
    );

    res.status(201).json({ volunteerId: volunteerId || volunteer.id });
  } catch (error) {
    console.error("Error managing volunteer:", error);
    res.status(500).json({ message: "Error managing volunteer", error });
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
};