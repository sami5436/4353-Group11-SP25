const connectDB = require("../db");
const { ObjectId } = require("mongodb");
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');

let db;
connectDB().then(database => db = database);

const getReportSummary = async (req, res) => {
  try {
    const eventsCollection = db.collection("events");
    const usersCollection = db.collection("users");

    const totalVolunteers = await usersCollection.countDocuments({ userType: "volunteer" });

    const upcomingEvents = await eventsCollection.countDocuments({ status: "Upcoming" });

    const completedEvents = await eventsCollection.countDocuments({ status: "Completed" });

    const allEvents = await eventsCollection.find({}).toArray();
    let totalHours = 0;
    
    //Hours calculated based on urgency, anywhere from 3-8
    allEvents.forEach(event => {
      if (Array.isArray(event.volunteers) && event.volunteers.length > 0) {
        if (event.urgency === "High") {
          totalHours += 8;
        }
        else if (event.urgency === "Medium") {
          totalHours += 5;
        }
        else {
          totalHours += 3;
        }
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

const generateVolunteersReport = async (req, res) => {
  try {
    const format = req.query.format || 'pdf';
    const usersCollection = db.collection("users");
    const eventsCollection = db.collection("events");
    
    // Get all volunteers
    const volunteers = await usersCollection.find({ userType: "volunteer" }).toArray();
    
    // Get all events
    const events = await eventsCollection.find({}).toArray();
    
    // Create volunteer participation history
    const volunteersWithHistory = await Promise.all(volunteers.map(async (volunteer) => {
      const participationHistory = events.filter(event => 
        event.volunteers && event.volunteers.includes(volunteer._id.toString())
      ).map(event => ({
        eventName: event.name,
        date: event.date,
        status: event.status,
        role: event.roles ? event.roles[volunteer._id.toString()] : 'Volunteer'
      }));
      
      return {
        _id: volunteer._id,
        name: volunteer.name,
        email: volunteer.email,
        phone: volunteer.phone,
        skills: volunteer.skills || [],
        participationCount: participationHistory.length,
        participationHistory
      };
    }));
    
    // Generate the report based on the requested format
    if (format === 'pdf') {
      return generatePdfVolunteersReport(res, volunteersWithHistory);
    } else if (format === 'csv') {
      return generateCsvVolunteersReport(res, volunteersWithHistory);
    } else {
      return res.status(400).json({ message: "Unsupported format. Supported formats: pdf, csv" });
    }
  } catch (error) {
    console.error("Error generating volunteers report:", error);
    res.status(500).json({ message: "Error generating volunteers report", error: error.message });
  }
};

const generateEventsReport = async (req, res) => {
  try {
    const format = req.query.format || 'pdf';
    const eventsCollection = db.collection("events");
    const usersCollection = db.collection("users");
    
    // Get all events
    const events = await eventsCollection.find({}).toArray();
    
    // Get all volunteers
    const volunteers = await usersCollection.find({ userType: "volunteer" }).toArray();
    const volunteersMap = {};
    volunteers.forEach(volunteer => {
      volunteersMap[volunteer._id.toString()] = volunteer;
    });
    
    // Enhance events with volunteer details
    const enhancedEvents = events.map(event => {
      const assignedVolunteers = [];
      
      if (event.volunteers && Array.isArray(event.volunteers)) {
        event.volunteers.forEach(volunteerId => {
          const volunteer = volunteersMap[volunteerId];
          if (volunteer) {
            assignedVolunteers.push({
              id: volunteerId,
              name: volunteer.name,
              email: volunteer.email,
              role: event.roles ? event.roles[volunteerId] : 'Volunteer'
            });
          }
        });
      }
      
      return {
        id: event._id,
        name: event.name,
        date: event.date,
        location: event.city,
        status: event.status,
        description: event.description,
        urgency: event.urgency,
        skills: event.skills || [],
        volunteerCount: assignedVolunteers.length,
        volunteers: assignedVolunteers
      };
    });
    
    // Generate the report based on the requested format
    if (format === 'pdf') {
      return generatePdfEventsReport(res, enhancedEvents);
    } else if (format === 'csv') {
      return generateCsvEventsReport(res, enhancedEvents);
    } else {
      return res.status(400).json({ message: "Unsupported format. Supported formats: pdf, csv" });
    }
  } catch (error) {
    console.error("Error generating events report:", error);
    res.status(500).json({ message: "Error generating events report", error: error.message });
  }
};

const generateSummaryReport = async (req, res) => {
  try {
    const format = req.query.format || 'pdf';
    
    // Fetch all the summary data
    const summaryData = await getSummaryReportData();
    
    // Generate the report based on the requested format
    if (format === 'pdf') {
      return generatePdfSummaryReport(res, summaryData);
    } else if (format === 'csv') {
      return generateCsvSummaryReport(res, summaryData);
    } else {
      return res.status(400).json({ message: "Unsupported format. Supported formats: pdf, csv" });
    }
  } catch (error) {
    console.error("Error generating summary report:", error);
    res.status(500).json({ message: "Error generating summary report", error: error.message });
  }
};

// Helper function to get all summary data
const getSummaryReportData = async () => {
  const eventsCollection = db.collection("events");
  const usersCollection = db.collection("users");
  
  const totalVolunteers = await usersCollection.countDocuments({ userType: "volunteer" });
  const upcomingEvents = await eventsCollection.countDocuments({ status: "Upcoming" });
  const completedEvents = await eventsCollection.countDocuments({ status: "Completed" });
  
  const allEvents = await eventsCollection.find({}).toArray();
  let totalHours = 0;
  
  allEvents.forEach(event => {
    if (Array.isArray(event.volunteers) && event.volunteers.length > 0) {
      if (event.urgency === "High") {
        totalHours += 8;
      } else if (event.urgency === "Medium") {
        totalHours += 5;
      } else {
        totalHours += 3;
      }
    }
  });
  
  // Get monthly engagement data
  const monthlyData = {};
  const currentYear = new Date().getFullYear();
  
  allEvents.forEach(event => {
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
  const engagementData = months.map((month, index) => ({
    month: month,
    volunteers: monthlyData[index]?.volunteers || 0,
    events: monthlyData[index]?.events || 0
  }));
  
  // Get status distribution
  const statusCounts = await eventsCollection.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]).toArray();
  
  const distributionData = statusCounts.map(item => ({
    status: item._id,
    count: item.count
  }));
  
  // Get skills distribution
  const skillsCount = {};
  
  allEvents.forEach(event => {
    if (event.skills && Array.isArray(event.skills)) {
      event.skills.forEach(skill => {
        if (!skillsCount[skill]) {
          skillsCount[skill] = 0;
        }
        skillsCount[skill]++;
      });
    }
  });
  
  const skillsData = Object.keys(skillsCount).map(skill => ({
    skill: skill,
    count: skillsCount[skill]
  }));
  
  skillsData.sort((a, b) => b.count - a.count);
  
  return {
    overview: {
      totalVolunteers,
      volunteerHours: totalHours,
      upcomingEvents,
      completedEvents
    },
    engagement: engagementData,
    distribution: distributionData,
    skills: skillsData
  };
};

// PDF Report Generation Functions
const generatePdfVolunteersReport = (res, volunteersData) => {
  const doc = new PDFDocument();
  
  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=volunteers_report.pdf');
  
  // Pipe the PDF to the response
  doc.pipe(res);
  
  // Add title and content...
  // (your existing code)
  
  // Make sure to end the document
  doc.end();
};

// Implement missing PDF functions
const generatePdfEventsReport = (res, eventsData) => {
  const doc = new PDFDocument();
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=events_report.pdf');
  
  doc.pipe(res);
  
  doc.fontSize(24).text('Events Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
  doc.moveDown(2);
  
  // Summary
  doc.fontSize(18).text('Summary');
  doc.moveDown();
  doc.fontSize(12).text(`Total Events: ${eventsData.length}`);
  
  // Events by status
  const statusCounts = {};
  eventsData.forEach(event => {
    if (!statusCounts[event.status]) statusCounts[event.status] = 0;
    statusCounts[event.status]++;
  });
  
  Object.entries(statusCounts).forEach(([status, count]) => {
    doc.text(`${status} Events: ${count}`);
  });
  doc.moveDown(2);
  
  // List all events
  doc.fontSize(18).text('Event List');
  doc.moveDown();
  
  eventsData.forEach((event, index) => {
    doc.fontSize(14).text(`${index + 1}. ${event.name}`);
    doc.fontSize(12).text(`Date: ${new Date(event.date).toLocaleDateString()}`);
    doc.text(`Location: ${event.location}`);
    doc.text(`Status: ${event.status}`);
    doc.text(`Urgency: ${event.urgency}`);
    doc.text(`Required Skills: ${event.skills.join(', ') || 'None'}`);
    doc.text(`Volunteers: ${event.volunteerCount}`);
    
    if (event.volunteers.length > 0) {
      doc.text('Assigned Volunteers:');
      event.volunteers.forEach(volunteer => {
        doc.text(`• ${volunteer.name} (${volunteer.email}) - ${volunteer.role}`, { indent: 20 });
      });
    }
    
    doc.moveDown();
  });
  
  doc.end();
};

const generatePdfSummaryReport = (res, summaryData) => {
  const doc = new PDFDocument();
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=summary_report.pdf');
  
  doc.pipe(res);
  
  doc.fontSize(24).text('Summary Analytics Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
  doc.moveDown(2);
  
  // Overview section
  doc.fontSize(18).text('Overview');
  doc.moveDown();
  doc.fontSize(12).text(`Total Volunteers: ${summaryData.overview.totalVolunteers}`);
  doc.text(`Total Volunteer Hours: ${summaryData.overview.volunteerHours}`);
  doc.text(`Upcoming Events: ${summaryData.overview.upcomingEvents}`);
  doc.text(`Completed Events: ${summaryData.overview.completedEvents}`);
  doc.moveDown(2);
  
  // Monthly engagement
  doc.fontSize(18).text('Monthly Engagement');
  doc.moveDown();
  summaryData.engagement.forEach(item => {
    if (item.events > 0 || item.volunteers > 0) {
      doc.text(`${item.month}: ${item.events} events, ${item.volunteers} volunteer assignments`);
    }
  });
  doc.moveDown(2);
  
  // Event distribution by status
  doc.fontSize(18).text('Event Distribution');
  doc.moveDown();
  summaryData.distribution.forEach(item => {
    doc.text(`${item.status}: ${item.count} events`);
  });
  doc.moveDown(2);
  
  // Skills distribution
  doc.fontSize(18).text('Skills Distribution');
  doc.moveDown();
  summaryData.skills.slice(0, 10).forEach(item => {
    doc.text(`${item.skill}: ${item.count} events`);
  });
  
  doc.end();
};

const generateCsvVolunteersReport = (res, volunteersData) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=volunteers_report.csv');
  
  // Transform data for CSV
  const flattenedData = volunteersData.map(volunteer => ({
    id: volunteer._id.toString(),
    name: volunteer.name,
    email: volunteer.email,
    phone: volunteer.phone || '',
    skills: volunteer.skills.join(', '),
    participationCount: volunteer.participationCount
  }));
  
  // Use json2csv to convert data to CSV
  try {
    const parser = new Parser({ fields: Object.keys(flattenedData[0] || {}) });
    const csv = parser.parse(flattenedData);
    res.send(csv);
  } catch (err) {
    console.error('Error generating CSV:', err);
    res.status(500).send('Error generating CSV report');
  }
};

const generateCsvEventsReport = (res, eventsData) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=events_report.csv');
  
  // Transform data for CSV
  const flattenedData = eventsData.map(event => ({
    id: event.id.toString(),
    name: event.name,
    date: new Date(event.date).toLocaleDateString(),
    location: event.location,
    status: event.status,
    urgency: event.urgency,
    skills: event.skills.join(', '),
    volunteerCount: event.volunteerCount
  }));
  
  try {
    const parser = new Parser({ fields: Object.keys(flattenedData[0] || {}) });
    const csv = parser.parse(flattenedData);
    res.send(csv);
  } catch (err) {
    console.error('Error generating CSV:', err);
    res.status(500).send('Error generating CSV report');
  }
};

const generateCsvSummaryReport = (res, summaryData) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=summary_report.csv');
  
  // Create multiple sections in the CSV
  try {
    // Overview data
    const overviewFields = ['metric', 'value'];
    const overviewData = [
      { metric: 'Total Volunteers', value: summaryData.overview.totalVolunteers },
      { metric: 'Volunteer Hours', value: summaryData.overview.volunteerHours },
      { metric: 'Upcoming Events', value: summaryData.overview.upcomingEvents },
      { metric: 'Completed Events', value: summaryData.overview.completedEvents }
    ];
    const overviewParser = new Parser({ fields: overviewFields });
    const overviewCsv = overviewParser.parse(overviewData);
    
    // Engagement data
    const engagementParser = new Parser();
    const engagementCsv = engagementParser.parse(summaryData.engagement);
    
    // Distribution data
    const distributionParser = new Parser();
    const distributionCsv = distributionParser.parse(summaryData.distribution);
    
    // Skills data
    const skillsParser = new Parser();
    const skillsCsv = skillsParser.parse(summaryData.skills);
    
    // Combine all sections
    const fullCsv = [
      'OVERVIEW',
      overviewCsv,
      '\nMONTHLY ENGAGEMENT',
      engagementCsv,
      '\nEVENT DISTRIBUTION',
      distributionCsv,
      '\nSKILLS DISTRIBUTION',
      skillsCsv
    ].join('\n');
    
    res.send(fullCsv);
  } catch (err) {
    console.error('Error generating CSV:', err);
    res.status(500).send('Error generating CSV report');
  }
};

module.exports = {
  getReportSummary,
  getVolunteerEngagement,
  getEventDistribution,
  getSkillsDistribution,
  getTopLocations,
  generateVolunteersReport,  
  generateEventsReport,     
  generateSummaryReport
}