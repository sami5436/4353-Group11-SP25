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
      notifId: parseInt(id),
      recipientId: userId
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found or you don't have permission" });
    }

    const result = await notificationsCollection.updateOne(
      { notifId: parseInt(id), recipientId: userId },
      { $set: { read: true } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    const updatedNotification = await notificationsCollection.findOne({
      notifId: parseInt(id),
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

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};