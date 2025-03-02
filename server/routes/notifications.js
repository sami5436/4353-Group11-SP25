const express = require("express");
const { 
  getNotifications, 
  markAsRead, 
  markAllAsRead 
} = require("../controllers/notifications");
const { validateNotificationUpdate } = require("../middleware/validateNotifications");

const router = express.Router();

router.get("/", getNotifications);

router.put("/:id/read", validateNotificationUpdate, markAsRead);

router.put("/markAllRead", markAllAsRead);

module.exports = router;