let events = [
  {
    id: 1,
    name: "Community Cleanup",
    date: "2024-01-10",
    city: "Houston",
    state: "TX",
    address: "123 Main St",
    status: "Completed",
    description: "A community effort to clean up litter and improve the park environment.",
    volunteered: true,
    skills: ["Manual Labor", "Event Coordination"],
    volunteers: [
      { id: "volunteer-1", name: "Sami Hamdalla", email: "sami@example.com" },
      { id: "volunteer-2", name: "Yusuf Khan2", email: "yusuf@example.com" },
      { id: "volunteer-8", name: "Yusuf xsKhan3", email: "yusuf@example.com" },
      { id: "volunteer-4", name: "Yusuf Khan4", email: "yusuf@example.com" },
      { id: "volunteer-5", name: "Yusuf Khan5", email: "yusuf@example.com"}
    ],
  },
  {
    id: 2,
    name: "Food Drive",
    date: "2024-03-15",
    city: "Austin",
    state: "TX",
    address: "456 Market St",
    status: "Upcoming",
    description: "An initiative to collect and distribute food to those in need in our community.",
    volunteered: false,
    skills: ["Food Services", "Manual Labor"],
    volunteers: [
      { id: "volunteer-3", name: "Lalalala", email: "lala@example.com" }
    ]
  }
];






// gather current volunteer history (mainly events) in volunteer profile
const getVolunteerHistory = (req, res) => {
  res.json(events);
};

// used in manage events page
const addEvent = (req, res) => {
  const { name, date, city, state, address, status, description, volunteered, skills } = req.body;

  if (!name || !date || !city || !state || !address || !status || !description) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const newEvent = {
    id: events.length + 1,
    name,
    date,
    city,
    state,
    address,
    status,
    description,
    volunteered: volunteered || false,
    skills: skills || [],
    volunteers: []
  };

  events.push(newEvent);
  res.status(201).json(newEvent);
};

// used in manage events page
const updateEvent = (req, res) => {
  const eventId = parseInt(req.params.id);
  const eventIndex = events.findIndex(event => event.id === eventId);

  if (eventIndex === -1) {
    return res.status(404).json({ message: "Event not found" });
  }

  const { name, date, city, state, address, status, description, skills } = req.body;

  if (status && typeof status !== "string") {
    return res.status(400).json({ message: "Invalid status format" });
  }

  events[eventIndex] = {
    ...events[eventIndex],
    name: name || events[eventIndex].name,
    date: date || events[eventIndex].date,
    city: city || events[eventIndex].city,
    state: state || events[eventIndex].state,
    address: address || events[eventIndex].address,
    status: status || events[eventIndex].status,
    description: description || events[eventIndex].description,
    skills: skills || events[eventIndex].skills
  };

  res.json(events[eventIndex]);
};

// used in manage events page
const getEvents = (req, res) => {
  const upcomingEventNames = events
    .filter(event => event.status.toLowerCase() === "upcoming")
    .map(event => event.name);
    
  res.json(upcomingEventNames);
};


// used in drag and drop thingy page
const getVolunteers = (req, res) => {
  let allVolunteers = events.flatMap(event =>
    event.volunteers.map(volunteer => ({
      eventName: event.name,
      ...volunteer
    }))
  );
    
  res.json(allVolunteers);
};

// used in drag and drop thingy page
const addVolunteerToEvent = (req, res) => {
  const { eventId, volunteerName, volunteerEmail } = req.body;
      
  const event = events.find(event => event.id === eventId);
  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }
    
  const newVolunteer = {
    id: `volunteer-${event.volunteers.length + 1}`,
    name: volunteerName,
    email: volunteerEmail
  };
    
  event.volunteers.push(newVolunteer);
  res.status(201).json(newVolunteer);
};




module.exports = {
  getVolunteerHistory,
  addEvent,
  getEvents,
  getVolunteers,
  addVolunteerToEvent,
  updateEvent
};