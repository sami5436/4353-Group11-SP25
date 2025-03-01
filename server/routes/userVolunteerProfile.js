
const express = require("express");
const { getUserProfile, updateUserProfile } = require("../controllers/userProfile");
const validateUserProfile = require("../middleware/validateUserProfile"); // Create this middleware for validation

const router = express.Router();

// Get user profile
router.get("/", getUserProfile);

// Update user profile
router.put("/", validateUserProfile, updateUserProfile);

module.exports = router;

