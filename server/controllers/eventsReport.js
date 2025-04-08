const connectDB = require("../db");
const { ObjectId } = require("mongodb");

let db;
connectDB().then(database => db = database);

const getReportSummary = async (req, res) => {
  try {
    const eventsCollection = db.collection("events");
    const usersCollection = db.collection("users");

    const totalVolunteers = await usersCollection.countDocuments({ role: "volunteer" });

    const upcomingEvents = await eventsCollection.countDocuments({ status: "Upcoming" });

    const completedEvents = await eventsCollection.countDocuments({ status: "Completed" });

    const allEvents = await eventsCollection.find({}).toArray();
    let totalHours = 0;
    
    allEvents.forEach(event => {
      if (event.volunteers && Array.isArray(event.volunteers)) {
        totalHours += event.volunteers.length * 5;
      }
    });

    res.json({
      totalVolunteers,
      volunteerHours: totalHours,
      upcomingEvents,
      completedEvents
    });
  } catch (error) {
    console.error("Error retrieving report summary:", error);
    res.status(500).json({ message: "Error retrieving report summary", error: error.message });
  }
};

const getVolunteerEngagement = async (req, res) => {
  try {
    const eventsCollection = db.collection("events");
    const events = await eventsCollection.find({}).toArray();
    
    const monthlyData = {};
    const currentYear = new Date().getFullYear();
    
    events.forEach(event => {
      const eventDate = new Date(event.date);
      if (eventDate.getFullYear() === currentYear) {
        const month = eventDate.getMonth(); 
        if (!monthlyData[month]) {
          monthlyData[month] = { volunteers: 0, events: 0 };
        }
        
        monthlyData[month].events++;
        if (event.volunteers && Array.isArray(event.volunteers)) {
          monthlyData[month].volunteers += event.volunteers.length;
        }
      }
    });
    
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedData = months.map((month, index) => ({
      month: month,
      volunteers: monthlyData[index]?.volunteers || 0,
      events: monthlyData[index]?.events || 0
    }));
    
    res.json(formattedData);
  } catch (error) {
    console.error("Error retrieving volunteer engagement:", error);
    res.status(500).json({ message: "Error retrieving volunteer engagement", error: error.message });
  }
};

const getEventDistribution = async (req, res) => {
  try {
    const eventsCollection = db.collection("events");
    
    const statusCounts = await eventsCollection.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]).toArray();
    
    const formattedStatus = statusCounts.map(item => ({
      status: item._id,
      count: item.count
    }));
    
    res.json(formattedStatus);
  } catch (error) {
    console.error("Error retrieving event distribution:", error);
    res.status(500).json({ message: "Error retrieving event distribution", error: error.message });
  }
};

const getSkillsDistribution = async (req, res) => {
  try {
    const eventsCollection = db.collection("events");
    const events = await eventsCollection.find({}).toArray();
    
    const skillsCount = {};
    
    events.forEach(event => {
      if (event.skills && Array.isArray(event.skills)) {
        event.skills.forEach(skill => {
          if (!skillsCount[skill]) {
            skillsCount[skill] = 0;
          }
          skillsCount[skill]++;
        });
      }
    });
    
    const skillsArray = Object.keys(skillsCount).map(skill => ({
      skill: skill,
      count: skillsCount[skill]
    }));
    
    skillsArray.sort((a, b) => b.count - a.count);
    
    res.json(skillsArray);
  } catch (error) {
    console.error("Error retrieving skills distribution:", error);
    res.status(500).json({ message: "Error retrieving skills distribution", error: error.message });
  }
};

const getTopLocations = async (req, res) => {
  try {
    const eventsCollection = db.collection("events");
    
    const locationCounts = await eventsCollection.aggregate([
      { $group: { _id: "$city", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 } 
    ]).toArray();
    
    const formattedLocations = locationCounts.map(item => ({
      city: item._id,
      count: item.count
    }));
    
    res.json(formattedLocations);
  } catch (error) {
    console.error("Error retrieving top locations:", error);
    res.status(500).json({ message: "Error retrieving top locations", error: error.message });
  }
};

module.exports = {
  getReportSummary,
  getVolunteerEngagement,
  getEventDistribution,
  getSkillsDistribution,
  getTopLocations
};