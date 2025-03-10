let adminInfo = {
    fullName: "John Doe",
    adminId: "ABC1235453454",
    email: "john.doe@example.com",
    phone: "123-456-7890",
    position: "Administrator",
    emergencyContact: "Jane Doe",
    emergencyPhone: "111-222-3333",
    fullySignedUp: false
  };
  
  const getAdminProfile = (req, res) => {
    res.json(adminInfo);
  };
  
  const updateAdminProfile = (req, res) => {
    const { fullName, email, phone, emergencyContact, emergencyPhone } = req.body;
    
    if (fullName) adminInfo.fullName = fullName;
    if (email) adminInfo.email = email;
    if (phone) adminInfo.phone = phone;
    if (emergencyContact) adminInfo.emergencyContact = emergencyContact;
    if (emergencyPhone) adminInfo.emergencyPhone = emergencyPhone;

    adminInfo.fullySignedUp = Boolean(
      adminInfo.fullName &&
      adminInfo.email &&
      adminInfo.phone &&
      adminInfo.emergencyContact &&
      adminInfo.emergencyPhone
    );
    
    res.json(adminInfo);
  };
  
  module.exports = {
    getAdminProfile,
    updateAdminProfile
  };