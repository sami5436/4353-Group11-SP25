const express = require('express');
const router = express.Router();
const { 
  getVolunteerHistory, 
  addEvent, 
  getEvents, 
  getVolunteers, 
  addVolunteerToEvent,
  updateEvent,
  getAllVolunteers
} = require('../controllers/eventsController');

// GET all events to match frontend request
router.get('/', getVolunteerHistory);

// Add route for volunteerHistory POST and PUT requests
router.post('/volunteerHistory', addEvent);
router.get('/allVolunteers', getAllVolunteers);

// Keep existing routes
router.get('/history', getVolunteerHistory);
router.post('/', addEvent);
router.get('/upcoming', getEvents);
router.get('/volunteers', getVolunteers);
router.post('/addVolunteer', addVolunteerToEvent);
router.put('/:id', updateEvent);

module.exports = router;