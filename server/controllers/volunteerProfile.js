// In-memory storage for the volunteer profile
let volunteerProfile = {
  firstName: "",
  lastName: "",
  email: "",
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
  preferences: ""
};

// GET request handler to retrieve the volunteer profile
const getVolunteerProfile = (req, res) => {
  res.json(volunteerProfile); // Respond with the current volunteer profile
};

// PUT request handler to update the volunteer profile
const updateVolunteerProfile = (req, res) => {
  const { 
    firstName, 
    lastName, 
    email, 
    phone, 
    dateOfBirth, 
    gender, 
    address1, 
    city1, 
    state1, 
    zipCode1, 
    address2, 
    city2, 
    state2, 
    zipCode2, 
    skills, 
    availability,
    preferences
  } = req.body;

  // Conditionally update fields if they are present in the request body
  if (firstName !== undefined) volunteerProfile.firstName = firstName;
  if (lastName !== undefined) volunteerProfile.lastName = lastName;
  if (email !== undefined) volunteerProfile.email = email;
  if (phone !== undefined) volunteerProfile.phone = phone;
  if (dateOfBirth !== undefined) volunteerProfile.dateOfBirth = dateOfBirth;
  if (gender !== undefined) volunteerProfile.gender = gender;
  if (address1 !== undefined) volunteerProfile.address1 = address1;
  if (city1 !== undefined) volunteerProfile.city1 = city1;
  if (state1 !== undefined) volunteerProfile.state1 = state1;
  if (zipCode1 !== undefined) volunteerProfile.zipCode1 = zipCode1;
  if (address2 !== undefined) volunteerProfile.address2 = address2;
  if (city2 !== undefined) volunteerProfile.city2 = city2;
  if (state2 !== undefined) volunteerProfile.state2 = state2;
  if (zipCode2 !== undefined) volunteerProfile.zipCode2 = zipCode2;
  if (skills !== undefined) volunteerProfile.skills = skills;
  if (availability !== undefined) volunteerProfile.availability = availability;
  if (preferences !== undefined) volunteerProfile.preferences = preferences;

  res.status(200).json({ message: "Profile updated successfully", volunteerProfile });
};

// Export the controller functions
module.exports = {
  getVolunteerProfile,
  updateVolunteerProfile
};
