const express = require('express');
const { signup, login, checkRole } = require('../controllers/authController');

const router = express.Router();

router.use((req, res, next) => {
  // console.log('Request Body:', req.body);
  next();
});


router.post('/signup', (req, res) => {
  // console.log('Incoming Signup Data:', req.body);
  signup(req, res);
});

router.get('/role', (req, res) => {
  checkRole(req, res);
})

router.post('/login', login);

module.exports = router;