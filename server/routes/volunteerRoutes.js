const express = require('express');
const router = express.Router();
const { 
  getEventsByVolunteerId,
  getUpcomingEventsByVolunteerId
} = require('../controllers/volunteerController');


router.get('/volunteer/:id', getEventsByVolunteerId);
router.get('/volunteer/:id/upcoming', getUpcomingEventsByVolunteerId);

module.exports = router;