const express = require('express');
const router = express.Router();
const { 
  getVolunteerHistory, 
  addEvent, 
  getEvents, 
  getVolunteers, 
  addVolunteerToEvent,
  updateEvent  
} = require('../controllers/eventsController');

// GET all volunteer history events
router.get('/history', getVolunteerHistory);

// POST a new event
router.post('/', addEvent);

// GET upcoming events names only
router.get('/upcoming', getEvents);

// GET all volunteers across all events
router.get('/volunteers', getVolunteers);

// POST add a volunteer to an event
router.post('/addVolunteer', addVolunteerToEvent);

// PUT update an existing event (new endpoint)
router.put('/:id', updateEvent);

module.exports = router;