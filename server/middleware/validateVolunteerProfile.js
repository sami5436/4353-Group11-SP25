const validateVolunteerProfile = (req, res, next) => {
  const { firstName, lastName, address1, city1, state1, zipCode1 } = req.body;
  const errors = [];

  if (!firstName || !lastName || !address1 || !city1 || !state1 || !zipCode1) {
    errors.push("All fields are required.");
  }

  // Add more validation as needed (e.g., regex for zip code)

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

module.exports = validateVolunteerProfile;