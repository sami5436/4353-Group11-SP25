const express = require("express");
const router = express.Router();
const { getVolunteerProfile, updateVolunteerProfile } = require("../controllers/volunteerProfile");
const validateVolunteerProfile = require("../middleware/validateVolunteerProfile"); // Create this middleware for validation

// Route to get volunteer profile by user ID
router.get('/volunteer/:id', getVolunteerProfile);

// Update user profile
router.put("/", validateVolunteerProfile, updateVolunteerProfile);

module.exports = router;

