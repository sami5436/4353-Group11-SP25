const express = require("express");
const { 
  getNotifications, 
  markAsRead, 
  markAllAsRead,
  sendEventReminders,
  checkAndSendAllReminders
} = require("../controllers/notifications");
const { validateNotificationUpdate } = require("../middleware/validateNotifications");

const router = express.Router();

router.get("/", getNotifications);

router.put("/:id/read", validateNotificationUpdate, markAsRead);

router.put("/markAllRead", markAllAsRead);

router.get("/check-all-reminders", checkAndSendAllReminders);

router.get("/send-reminders", sendEventReminders);

module.exports = router;