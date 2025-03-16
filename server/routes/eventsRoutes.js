const express = require('express');
const router = express.Router();
const { 
  getVolunteerHistory, 
  addEvent, 
  getEvents, 
  getVolunteers, 
  addVolunteerToEvent,
  updateEvent,
  getAllVolunteers,
  getEventsByVolunteerId
} = require('../controllers/eventsController');

router.get('/', getVolunteerHistory);

router.post('/volunteerHistory', addEvent);
router.get('/allVolunteers', getAllVolunteers);
router.get('/volunteer/:id', getEventsByVolunteerId);

router.get('/history', getVolunteerHistory);
router.post('/', addEvent);
router.get('/upcoming', getEvents);
router.get('/volunteers', getVolunteers);
router.post('/addVolunteer', addVolunteerToEvent);
router.put('/:id', updateEvent);

module.exports = router;