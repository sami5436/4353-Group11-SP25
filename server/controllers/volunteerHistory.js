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
    volunteers: [
      { id: "volunteer-1", name: "Sami Hamdalla", email: "sami@example.com" },
      { id: "volunteer-2", name: "Yusuf Khan2", email: "yusuf@example.com" },
      { id: "volunteer-8", name: "Yusuf xsKhan3", email: "yusuf@example.com" },
      { id: "volunteer-4", name: "Yusuf Khan4", email: "yusuf@example.com" },
      { id: "volunteer-5", name: "Yusuf Khan5", email: "yusuf@example.com"}
    ]
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
    volunteers: [
      { id: "volunteer-3", name: "Lalalala", email: "lala@example.com" }
    ]
  }
];

// Get all events with their volunteer history
const getVolunteerHistory = (req, res) => {
  res.json(events);
};

// Add a new event
const addEvent = (req, res) => {
  const { name, date, city, state, address, status, description, volunteered } = req.body;
  const newEvent = {
    id: events.length + 1,
    name,
    date,
    city,
    state,
    address,
    status,
    description,
    volunteered,
    volunteers: [] // Initialize with an empty volunteer list
  };

  events.push(newEvent);
  res.status(201).json(newEvent);
};

// Get upcoming events only
const getEvents = (req, res) => {
  const upcomingEventNames = events
    .filter(event => event.status.toLowerCase() === "upcoming")
    .map(event => event.name);

  res.json(upcomingEventNames);
};

// Get all volunteers from all events
const getVolunteers = (req, res) => {
  let allVolunteers = events.flatMap(event =>
    event.volunteers.map(volunteer => ({
      eventName: event.name,
      ...volunteer
    }))
  );

  res.json(allVolunteers);
};

// Add a volunteer to an event
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

module.exports = { getVolunteerHistory, addEvent, getEvents, getVolunteers, addVolunteerToEvent };
