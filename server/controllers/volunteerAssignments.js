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
      skills: ["Food Services", "Manual Labor"],
      volunteers: [
        { id: "volunteer-3", name: "Lalalala", email: "lala@example.com" }
      ]
    }
  ];
  
  
  

  const getAssignments = (req, res) => {
    const { volunteerId } = req.query;
  
    if (!volunteerId) {
      return res.status(400).json({ error: "Volunteer ID is required" });
    }
  
    const assignedEvents = events.filter((event) =>
      event.volunteers.some((volunteer) => volunteer.id === volunteerId)
    );
    if (assignedEvents.length === 0) {
        return res.status(404).json({ error: "No events found for this volunteer." });
    }
    res.json(assignedEvents);
  };
  
  
 
  module.exports = {
    getAssignments
  };