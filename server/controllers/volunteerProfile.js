let userProfile = {
  firstName: "Joe",
  lastName: "Biden",
  address1: "1600 Pennsylvania Avenue",
  address2: "",
  city1: "Washington",
  state1: "DC",
  zipCode1: "20500",
  skills: [],
  preferences: "",
  availability: ""
};

const getUserProfile = (req, res) => {
  res.json(userProfile);
};

const updateUserProfile = (req, res) => {
  const { firstName, lastName, address1, address2, city1, state1, zipCode1, skills, preferences, availability } = req.body;

  // Update the user profile with the new data
  userProfile = { firstName, lastName, address1, address2, city1, state1, zipCode1, skills, preferences, availability };
  
  res.status(200).json({ message: "Profile updated successfully", userProfile });
};

module.exports = {
  getUserProfile,
  updateUserProfile
};
