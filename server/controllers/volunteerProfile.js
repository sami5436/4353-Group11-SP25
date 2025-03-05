// In-memory storage for the volunteer profile
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
  availability: "",
  skills: [],
  preferences: "",
  availability: ""
};

// GET request handler to retrieve the volunteer profile
const getVolunteerProfile = (req, res) => {
  console.log("Inside getVolunteerProfile");
  res.json(volunteerProfile); // Respond with the current volunteer profile
};

// PUT request handler to update the volunteer profile
const updateVolunteerProfile = (req, res) => {
  console.log("Inside updateVolunteerProfile");
  const { firstName, lastName, address1, address2, city1, state1, zipCode1, city2, state2, zipCode2, skills, preferences, availability } = req.body;

  // Conditionally update fields if they are present in the request body
  if (firstName !== undefined) volunteerProfile.firstName = firstName;
  if (lastName !== undefined) volunteerProfile.lastName = lastName;
  if (address1 !== undefined) volunteerProfile.address1 = address1;
  if (city1 !== undefined) volunteerProfile.city1 = city1;
  if (state1 !== undefined) volunteerProfile.state1 = state1;
  if (zipCode1 !== undefined) volunteerProfile.zipCode1 = zipCode1;
  if (address2 !== undefined) volunteerProfile.address2 = address2;
  if (city2 !== undefined) volunteerProfile.city2 = city2;
  if (state2 !== undefined) volunteerProfile.state2 = state2;
  if (zipCode2 !== undefined) volunteerProfile.zipCode2 = zipCode2;
  if (skills !== undefined) volunteerProfile.skills = skills;
  if (preferences !== undefined) volunteerProfile.preferences = preferences;
  if (availability !== undefined) volunteerProfile.availability = availability;
  console.log("Updated volunteer profile:", volunteerProfile); // Log the updated profile

  res.status(200).json({ message: "Profile updated successfully", volunteerProfile });
};

// Export the controller functions
module.exports = {
  getVolunteerProfile,
  updateVolunteerProfile
};
