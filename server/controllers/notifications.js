const connectDB = require("../db");
const { ObjectId } = require("mongodb");

let db;
connectDB().then((database) => (db = database));

const getNotifications = async (req, res) => {
  try {
    const { type, unread, recipientType } = req.query;
    const userId = req.cookies.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No user ID found in cookies" });
    }

    const query = {};

    if (recipientType) {
      query.recipientType = recipientType;
    }

    query.recipientId = userId;

    if (type && type !== "all") {
      query.notificationType = type;
    }

    // Only getting notifications that are unread or within a 2 week window
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);

    query.$or = [
      { timestamp: { $gte: oneMonthAgo } },
      { read: false }
    ];    

    if (unread === "true") {
      query.read = false;
    }

    const notificationsCollection = db.collection("notifications");
    const notifications = await notificationsCollection
      .find(query)
      .sort({ timestamp: -1 })
      .toArray();

    res.json(notifications);
  } catch (error) {
    console.error("Error retrieving notifications:", error);
    res.status(500).json({
      message: "Error retrieving notifications",
      error: error.message,
    });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.cookies.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No user ID found in cookies" });
    }

    const notificationsCollection = db.collection("notifications");

    const notification = await notificationsCollection.findOne({ 
      _id: new ObjectId(id),
      recipientId: userId
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found or you don't have permission" });
    }

    const result = await notificationsCollection.updateOne(
      { _id: new ObjectId(id), recipientId: userId },
      { $set: { read: true } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    const updatedNotification = await notificationsCollection.findOne({
      _id: new ObjectId(id),
      recipientId: userId
    });

    res.json(updatedNotification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      message: "Error marking notification as read",
      error: error.message,
    });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const { recipientType } = req.query;
    const userId = req.cookies.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No user ID found in cookies" });
    }

    const query = { 
      read: false,
      recipientId: userId
    };

    if (recipientType) {
      query.recipientType = recipientType;
    }

    const notificationsCollection = db.collection("notifications");

    const result = await notificationsCollection.updateMany(query, {
      $set: { read: true },
    });

    res.json({
      success: true,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({
      message: "Error marking all notifications as read",
      error: error.message,
    });
  }
};

const sendEventReminders = async (req, res) => {
  try {
    const { reminderDays = 3 } = req.query; 
    const daysBeforeEvent = parseInt(reminderDays);
    
    if (isNaN(daysBeforeEvent) || daysBeforeEvent < 0) {
      return res.status(400).json({ message: "Invalid reminderDays parameter" });
    }

    const eventsCollection = db.collection("events");
    const notificationsCollection = db.collection("notifications");
    
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysBeforeEvent);
    
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const formattedTargetDate = `${year}-${month}-${day}`;
    
    const upcomingEvents = await eventsCollection.find({
      date: formattedTargetDate,
      status: "Upcoming",
      volunteers: { $exists: true, $ne: [] }
    }).toArray();
    
    let notificationsCreated = 0;
    let eventCount = 0;
    let volunteerCount = 0;
    
    for (const event of upcomingEvents) {
      eventCount++;
      
      const eventIdString = event._id.toString();
      
      const existingReminders = await notificationsCollection.countDocuments({
        notificationType: "event_reminder",
        "metadata.eventId": eventIdString,
        "metadata.reminderDays": daysBeforeEvent
      });
      
      if (existingReminders > 0) {
        continue;
      }
      
      if (event.volunteers && event.volunteers.length > 0) {
        const reminderNotifications = event.volunteers.map(volunteerId => ({
          recipientId: volunteerId,
          recipientType: "volunteer",
          message: `Reminder: ${event.name} in ${daysBeforeEvent} days`,
          timestamp: new Date(),
          read: false,
          details: `Your event "${event.name}" is scheduled for ${event.date} at ${event.address}, ${event.city}, ${event.state}. Please make any necessary arrangements.`,
          notificationType: "event_reminder",
          metadata: {
            eventId: eventIdString,
            reminderDays: daysBeforeEvent
          }
        }));
        
        if (reminderNotifications.length > 0) {
          volunteerCount += reminderNotifications.length;
          const result = await notificationsCollection.insertMany(reminderNotifications);
          notificationsCreated += result.insertedCount;
        }
        
        if (event.createdBy) {
          const adminNotification = {
            recipientId: event.createdBy,
            recipientType: "admin",
            message: `Reminder: ${event.name} is in ${daysBeforeEvent} days`,
            timestamp: new Date(),
            read: false,
            details: `The event "${event.name}" you created is scheduled for ${event.date}. It has ${event.volunteers.length} registered volunteer(s).`,
            notificationType: "event_reminder",
            metadata: {
              eventId: eventIdString,
              reminderDays: daysBeforeEvent
            }
          };
          
          await notificationsCollection.insertOne(adminNotification);
          notificationsCreated++;
        }
      }
    }
    
    res.json({
      success: true,
      eventsProcessed: eventCount,
      volunteersNotified: volunteerCount,
      notificationsCreated
    });
  } catch (error) {
    console.error("Error sending event reminders:", error);
    res.status(500).json({
      message: "Error sending event reminders",
      error: error.message,
    });
  }
};


const checkAndSendAllReminders = async (req, res) => {
  try {
    const reminderIntervals = [1, 3, 7]; 
    const results = {};
    
    for (const days of reminderIntervals) {
      const mockReq = { query: { reminderDays: days } };
      const mockRes = {
        json: (data) => {
          results[`${days}_days`] = data;
        }
      };
      
      await sendEventReminders(mockReq, mockRes);
    }
    
    res.json({
      success: true,
      remindersSent: results
    });
  } catch (error) {
    console.error("Error in batch reminder process:", error);
    res.status(500).json({
      message: "Error processing batch reminders",
      error: error.message,
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  sendEventReminders,
  checkAndSendAllReminders
};