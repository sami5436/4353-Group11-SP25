const express = require('express');
const router = express.Router();
const { getAssignments, assignVolunteer } = require('../controllers/volunteerAssignments');

router.get('/', getAssignments);
router.post('/assignVolunteer/:id', assignVolunteer);
module.exports = router;
