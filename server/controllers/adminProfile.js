const connectDB = require("../db");
const { ObjectId } = require("mongodb");

let db;
connectDB().then((database) => (db = database));

const getAdminProfile = async (req, res) => {
  try {
    const userId = req.cookies.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No user ID found in cookies get" });
    }
    
    const adminsCollection = db.collection("users");
    const admin = await adminsCollection.findOne({ _id: new ObjectId(userId) });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json(admin);
  } catch (error) {
    console.error("Error retrieving admin profile:", error);
    res.status(500).json({ message: "Error retrieving admin profile", error: error.message });
  }
};

const updateAdminProfile = async (req, res) => {
  try {
    const userId = req.cookies.userId; 
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No user ID found in cookies update" });
    }

    const { fullName, email, phone, emergencyContact, emergencyPhone } = req.body;
    const adminsCollection = db.collection("users");

    const admin = await adminsCollection.findOne({ _id: new ObjectId(userId) });
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
      fullySignedUp: Boolean(fullName && email && phone && emergencyContact && emergencyPhone),
    };

    await adminsCollection.updateOne({ _id: new ObjectId(userId) }, { $set: updatedAdmin });

    res.json(updatedAdmin);
  } catch (error) {
    console.error("Error updating admin profile:", error);
    res.status(500).json({ message: "Error updating admin profile", error: error.message });
  }
};

module.exports = {
  getAdminProfile,
  updateAdminProfile,
};
