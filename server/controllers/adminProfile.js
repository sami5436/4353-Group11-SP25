const connectDB = require("../db");
const { ObjectId } = require("mongodb");

let db;
connectDB().then(database => db = database); 
  
const getAdminProfile = async (req, res) => {
  try {
    const adminId = req.params.adminId || "ADMIN-001";
    const adminsCollection = db.collection("admins");

    const admin = await adminsCollection.findOne({ adminId });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json(admin);
  }
  catch(error) {
    console.error("Error retrieving admin profile", error);
    res.status(500).json({ message: "Error retrieving admin profile", error:error.message });
  }
};
  

const updateAdminProfile = async (req, res) => {
  const { fullName, email, phone, emergencyContact, emergencyPhone } = req.body;
  const adminId = req.params.adminId || "ADMIN-001"; 

  try {
    const adminsCollection = db.collection("admins");

    const admin = await adminsCollection.findOne({ adminId });
    
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const updatedAdmin = {
      ...admin,
      fullName: fullName || admin.fullName,
      email: email || admin.email,
      phone: phone || admin.phone,
      emergencyContact: emergencyContact || admin.emergencyContact,
      emergencyPhone: emergencyPhone || admin.emergencyPhone,
      fullySignedUp: Boolean(
        fullName && email && phone && emergencyContact && emergencyPhone
      ),
    };

    await adminsCollection.updateOne(
      { adminId },
      { $set: updatedAdmin }
    );

    res.json(updatedAdmin);
  } catch (error) {
    console.error("Error updating admin profile:", error);
    res.status(500).json({ message: "Error updating admin profile", error: error.message });
  }
};

module.exports = {
  getAdminProfile,
  updateAdminProfile
};