const connectDB = require("../db");
const { ObjectId } = require("mongodb");

let db;
connectDB().then((database) => (db = database));

const getNotifications = async (req, res) => {
  try {
    const { type, unread, recipientType, recipientId } = req.query;

    const query = {};

    if (recipientType) {
      query.recipientType = recipientType;
    }

    if (recipientId) {
      query.recipientId = recipientId;
    }

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
    // console.error("Error retrieving notifications:", error);
    // res
    //   .status(500)
    //   .json({
    //     message: "Error retrieving notifications",
    //     error: error.message,
    //   });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notificationsCollection = db.collection("notifications");

    const result = await notificationsCollection.updateOne(
      { notifId: parseInt(id) },
      { $set: { read: true } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    const updatedNotification = await notificationsCollection.findOne({
      notifId: parseInt(id),
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
    const { recipientType, recipientId } = req.query;

    const query = { read: false };

    if (!recipientType && !recipientId) {
      return res
        .status(400)
        .json({ message: "Either recipientType or recipientId is required" });
    }

    if (recipientType) {
      query.recipientType = recipientType;
    }

    if (recipientId) {
      query.recipientId = recipientId;
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
