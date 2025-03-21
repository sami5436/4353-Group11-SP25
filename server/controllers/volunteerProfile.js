const { ObjectId } = require("mongodb");
const connectDB = require("../db");

// Step 1: Extract volunteerId
const getVolunteerProfile = async (req, res) => {
  const volunteerId = req.params.id; // Extracting volunteerId from request parameters
  console.log("Extracted Volunteer ID:", volunteerId); // Log the volunteer ID for debugging

  // Step 2: Connect to the Database
  try {
    const db = await connectDB(); // Attempt to connect to the database
    console.log("Database connection successful!"); // Log success message

    // Step 3: Query the Database
    const volunteerProfile = await db.collection("users").findOne({ _id: new ObjectId(volunteerId) });

    // Step 4: Handle the Response
    if (!volunteerProfile) {
      return res.status(404).json({ message: "Volunteer not found" }); // Return 404 if not found
    }

    res.json(volunteerProfile); // Return the volunteer profile data
  } catch (error) {
    console.error("Error retrieving volunteer profile:", error); // Log any errors
    return res.status(500).json({ message: "Error retrieving volunteer profile", error: error.message }); // Return error response
  }
};

// const updateVolunteerProfile = async (req, res) => {
//   // Your update logic here
// };

// Export the controller functions
module.exports = {
  getVolunteerProfile,
  // updateVolunteerProfile
};
