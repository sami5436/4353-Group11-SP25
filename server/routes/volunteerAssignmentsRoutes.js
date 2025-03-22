const express = require('express');
const router = express.Router();
const { assignVolunteer } = require('../controllers/volunteerAssignments');

router.post('/assignVolunteer/:id', assignVolunteer);
module.exports = router;
