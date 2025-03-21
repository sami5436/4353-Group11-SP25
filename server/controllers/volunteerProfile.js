// Mock data for testing
const volunteerProfiles = {
"67dce803db4ecdec059f7297": { firstName: "Diana", lastName: "Nguyen", email: "diana_test1@volunteer.com" },
"456": { firstName: "Jane", lastName: "Smith", email: "jane@example.com" },
};

const getVolunteerProfile = async (req, res) => {
  console.log("inside controller")
  const volunteerId = req.params.id; // Get user ID from request parameters
  console.log("Retrieved volunteer ID:", volunteerId); // Log the volunteer ID

  // Check if the volunteerId exists in the mock data
  if (volunteerProfiles[volunteerId]) {
    console.log("ID is in mock data"); // Log if the ID exists
  } else {
    console.log("ID is NOT in mock data"); // Log if the ID does not exist
  }

  // Use mock data instead of actual DB call
  const profile = volunteerProfiles[volunteerId]; // Replace with actual DB call
  console.log("Fetched profile:", profile); // Log the fetched profile

  if (!profile) {
    return res.status(404).json({ message: "Profile not found" });
  }

  res.json(profile); // Respond with the current volunteer profile
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
