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
    },
  ];
  
  const getVolunteerHistory = (req, res) => {
    res.json(events);
  };
  
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
    };
  
    events.push(newEvent);
    res.status(201).json(newEvent);
  };
  
  module.exports = { getVolunteerHistory, addEvent };
  