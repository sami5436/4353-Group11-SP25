const validateVolunteerProfile = (req, res, next) => {
  const { 
    firstName, 
    lastName, 
    email, 
    phone, 
    dateOfBirth, 
    address1, 
    city1, 
    state1, 
    zipCode1, 
    address2, 
    city2, 
    state2, 
    zipCode2 
  } = req.body;

  const errors = [];

  // Validate required fields
  if (!firstName || !lastName || !address1 || !city1 || !state1 || !zipCode1) {
    errors.push("All primary address fields are required.");
  }

  // Validate date of birth
  if (dateOfBirth) {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    if (dob > today) {
      errors.push("Date of birth cannot be in the future.");
    }
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    errors.push("Email must be in a valid format (e.g., user@example.com).");
  }

  // Validate phone number format (xxx-xxx-xxxx)
  const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
  if (phone && !phoneRegex.test(phone)) {
    errors.push("Phone number must be in the format xxx-xxx-xxxx.");
  }

  // Validate city fields to contain only letters
  const cityRegex = /^[A-Za-z\s]+$/;
  if (!cityRegex.test(city1)) {
    errors.push("Primary city must contain only letters.");
  }
  if (city2 && !cityRegex.test(city2)) {
    errors.push("Secondary city must contain only letters.");
  }

  // Validate zip code fields to be exactly 5 digits
  const zipCodeRegex = /^\d{5}$/;
  if (!zipCodeRegex.test(zipCode1)) {
    errors.push("Primary zip code must contain integers and be exactly 5 digits.");
  }
  if (zipCode2 && !zipCodeRegex.test(zipCode2)) {
    errors.push("Secondary zip code must contain integers and be exactly 5 digits.");
  }

  // Optional: Add validation for second address fields if needed
  if ((address2 || city2 || state2 || zipCode2) && (!address2 || !city2 || !state2 || !zipCode2)) {
    errors.push("All secondary address fields must be provided if any are present.");
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

module.exports = validateVolunteerProfile;