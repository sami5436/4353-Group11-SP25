let volunteerProfile = {
  firstName: "",
  lastName: "",
  address1: "",
  city1: "",
  state1: "",
  zipCode1: "",
  address2: "",
  city2: "",
  state2: "",
  zipCode2: "",
  skills: [],
  preferences: "",
  availability: ""
};

const getVolunteerProfile = (req, res) => {
  res.json(volunteerProfile);
};

const updateVolunteerProfile = (req, res) => {
  const { firstName, lastName, address1, address2, city1, state1, zipCode1, skills, preferences, availability } = req.body;

  // Update the user profile with the new data
  volunteerProfile = { firstName, lastName, address1, address2, city1, state1, zipCode1, skills, preferences, availability };
  
  res.status(200).json({ message: "Profile updated successfully", volunteerProfile });
};

module.exports = {
  getVolunteerProfile,
  updateVolunteerProfile
};
