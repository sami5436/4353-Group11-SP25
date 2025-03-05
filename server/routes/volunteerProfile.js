const express = require("express");
const router = express.Router();
const { getVolunteerProfile, updateVolunteerProfile } = require("../controllers/volunteerProfile");
const validateVolunteerProfile = require("../middleware/validateVolunteerProfile"); // Create this middleware for validation


// Get user profile
router.get("/", getVolunteerProfile);

// Update user profile
router.put("/", validateVolunteerProfile, updateVolunteerProfile);

module.exports = router;

