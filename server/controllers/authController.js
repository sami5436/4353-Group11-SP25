const bcrypt = require('bcrypt');
const connectDB = require("../db");

let db;
// Initialize database connection
connectDB().then(database => {
  db = database;
}).catch(err => {
  console.error("Failed to connect to database:", err);
});

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return passwordRegex.test(password);
};

const signup = async (req, res) => {
  const { email, password, confirmPassword, role } = req.body;

  try {
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters long and contain uppercase, lowercase, and number' 
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Check if user already exists
    const usersCollection = db.collection('users');
    const existingUser = await usersCollection.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user based on role
    let newUser;
    
    if (role === 'admin') {
      newUser = {
        fullName: "",
        email,
        phone: "",
        emergencyContact: "",
        emergencyPhone: "",
        fullySignedUp: false,
        password: hashedPassword,
        userType: 'admin'
      };
    } else {
      // Default to volunteer
      newUser = {
        firstName: "",
        lastName: "",
        email,
        phone: "",
        dateOfBirth: "",
        gender: "",
        address1: "",
        city1: "",
        state1: "",
        zipCode1: "",
        address2: "",
        city2: "",
        state2: "",
        zipCode2: "",
        skills: [],
        availability: "",
        preferences: "",
        userType: 'volunteer',
        password: hashedPassword,
        fullySignedUp: "false"
      };
    }

    const result = await usersCollection.insertOne(newUser);

    res.status(201).json({ 
      message: 'User registered successfully',
      userId: result.insertedId,
      role: role || 'volunteer'
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find the user
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Determine redirect path based on user type
    const redirectPath = user.userType === 'admin' ? '/admin/profile' : '/volunteer/profile';

    res.status(200).json({ 
      message: 'Login successful', 
      userId: user._id,
      userType: user.userType,
      redirectPath: redirectPath
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  signup,
  login
};