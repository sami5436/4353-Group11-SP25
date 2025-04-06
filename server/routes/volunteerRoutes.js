const express = require('express');
const router = express.Router();
const { 
  getEventsByVolunteerId,
  getUpcomingEventsByVolunteerId,
  removeVolunteerFromEvent,
  getVolunteerById
} = require('../controllers/volunteerController');


router.get('/volunteer/:id', getEventsByVolunteerId);
router.get('/volunteer/data/:id', getVolunteerById);

router.get('/volunteer/:id/upcoming', getUpcomingEventsByVolunteerId);
router.delete("/event/:eventId/volunteer/:volunteerId", removeVolunteerFromEvent);


module.exports = router;