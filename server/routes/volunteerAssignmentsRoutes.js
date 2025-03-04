const express = require('express');
const router = express.Router();
const { 
  getAssignments
} = require('../controllers/volunteerAssignments');


router.get('/', getAssignments);



module.exports = router;