const validateVolunteerHistory = (req, res, next) => {
    const { name, date, city, state, address, status, description, volunteered } = req.body;
  
    if (!name || !date || !city || !state || !address || !status || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }
  
    if (typeof volunteered !== "boolean") {
      return res.status(400).json({ message: "Volunteered must be true or false" });
    }
  
    next();
  };
  
  module.exports = { validateVolunteerHistory };
  