const validateAdminProfile = (req, res, next) => {
    const { fullName, email, phone } = req.body;
    const errors = [];
  
    if (!fullName || fullName.trim() === "") {
      errors.push("Full name is required");
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      errors.push("Valid email is required");
    }
  
    if (phone) {
      const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
      if (!phoneRegex.test(phone)) {
        errors.push("Phone number should be in format XXX-XXX-XXXX");
      }
    }
  
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
  
    next();
  };
  
  module.exports = { validateAdminProfile };