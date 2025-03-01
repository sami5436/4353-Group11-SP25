const express = require("express");
const { getVolunteerHistory, addEvent, getEvents, getVolunteers, addVolunteerToEvent } = require("../controllers/volunteerHistory");
const { validateVolunteerHistory } = require("../middleware/validateVolunteerHistory");

const router = express.Router();

// Get all events for volunteer history
router.get("/", getVolunteerHistory);

// Get only upcoming events
router.get("/upcoming", getEvents);

// Get all volunteers
router.get("/volunteers", getVolunteers);

// Add a new event
router.post("/", validateVolunteerHistory, addEvent);

// Add a volunteer to a specific event
router.post("/addVolunteer", addVolunteerToEvent);

module.exports = router;
