const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, 'users.json');

let users = {};
let nextUserId = 1;

if (fs.existsSync(usersFilePath)) {
  const data = fs.readFileSync(usersFilePath, 'utf-8');
  users = JSON.parse(data);

  const userIds = Object.keys(users).map(key => users[key].id);
  nextUserId = userIds.length > 0 ? Math.max(...userIds) + 1 : 1;
}

const saveUsersToFile = () => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return passwordRegex.test(password);
};

const findUserByEmail = (email) => {
  return Object.values(users).find(user => user.email === email);
};

const signup = (req, res) => {
  const { email, password, confirmPassword, role } = req.body;

  try {
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (findUserByEmail(email)) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters long and contain uppercase, lowercase, and number' 
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const newUser = {
      id: nextUserId++,
      email,
      password, 
      role: role || 'user'
    };

    users[`user${newUser.id}`] = newUser;

    saveUsersToFile();

    res.status(201).json({ 
      message: 'User registered successfully', 
      userId: newUser.id 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const login = (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const user = findUserByEmail(email);

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    let redirectPath = '/volunteer/profile';
    if (user.role === 'admin') {
      redirectPath = '/admin/profile';
    }

    res.status(200).json({ 
      message: 'Login successful', 
      userId: user.id,
      role: user.role,
      redirectPath: redirectPath
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  signup,
  login,
  findUserByEmail
};