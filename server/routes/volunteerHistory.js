const express = require("express");
const { getVolunteerHistory, addEvent } = require("../controllers/volunteerHistory");
const { validateVolunteerHistory } = require("../middleware/validateVolunteerHistory");

const router = express.Router();

// Get all events for volunteer history
router.get("/", getVolunteerHistory);

// Add a new event (for testing purposes)
router.post("/", validateVolunteerHistory, addEvent);

module.exports = router;
