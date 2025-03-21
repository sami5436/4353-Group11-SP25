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

// Step 1: Extract volunteerId
const updateVolunteerProfile = async (req, res) => {
  const volunteerId = req.params.id; // Extracting volunteerId from request parameters
  console.log("updateVolunteer - Extracted Volunteer ID:", volunteerId); // Log the volunteer ID for debugging

  // Step 2: Connect to the Database
  try {
    const db = await connectDB(); // Attempt to connect to the database
    console.log("Database connection successful!"); // Log success message

    // Step 3: Prepare the Update Object
    const updatedData = req.body; // Get the updated data from the request body
    const { _id, ...updateObject } = req.body; // Exclude _id from the update object and Start with the incoming data

    // Check if required fields are filled to set fullySignedUp
    const requiredFieldsFilled = updatedData.firstName && updatedData.lastName && updatedData.email && updatedData.phone && updatedData.dateOfBirth && updatedData.gender && updatedData.address1 && updatedData.city1 && updatedData.state1 && updatedData.zipCode1;

    updateObject.fullySignedUp = requiredFieldsFilled; // Set fullySignedUp based on filled fields

    // Step 4: Update the Database
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(volunteerId) }, // Filter to find the correct volunteer
      { $set: updateObject } // Update the document with the new data
    );

    // Step 5: Handle the Response
    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Volunteer not found or no changes made" }); // Handle case where no document was updated
    }

    res.status(200).json({ message: "Profile updated successfully", volunteerProfile: updateObject }); // Return success message
  } catch (error) {
    console.error("Error updating volunteer profile:", error); // Log any errors
    return res.status(500).json({ message: "Error updating volunteer profile", error: error.message }); // Return error response
  }
};

// Export the controller functions
module.exports = {
  updateVolunteerProfile,
  // other functions...
};

// Export the controller functions
module.exports = {
  getVolunteerProfile,
  updateVolunteerProfile
};
