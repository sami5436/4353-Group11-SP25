const { ObjectId } = require("mongodb");
const connectDB = require("../db");

// Get volunteer profile by ID
const getVolunteerProfile = async (req, res) => {
  const volunteerId = req.params.id; // Extracting volunteerId from request parameters
  console.log("Extracted Volunteer ID:", volunteerId); // Log the volunteer ID for debugging
  
  // Connect to the Database
  try {
    const db = await connectDB(); // Attempt to connect to the database
    console.log("Database connection successful!"); // Log success message
    
    // Query the Database
    const volunteerProfile = await db.collection("users").findOne({ _id: new ObjectId(volunteerId) });
    
    // Handle the Response
    if (!volunteerProfile) {
      return res.status(404).json({ message: "Volunteer not found" }); // Return 404 if not found
    }
    
    res.json(volunteerProfile); // Return the volunteer profile data
  } catch (error) {
    console.error("Error retrieving volunteer profile:", error); // Log any errors
    return res.status(500).json({ message: "Error retrieving volunteer profile", error: error.message }); // Return error response
  }
};

// Update volunteer profile
const updateVolunteerProfile = async (req, res) => {
  const volunteerId = req.params.id; // Extracting volunteerId from request parameters
  console.log("updateVolunteer - Extracted Volunteer ID:", volunteerId); // Log the volunteer ID for debugging
  
  // Connect to the Database
  try {
    const db = await connectDB(); // Attempt to connect to the database
    console.log("Database connection successful!"); // Log success message
    
    // Get the updated data from the request body
    const { _id, ...updatedData } = req.body; // Exclude _id from the update object
    
    // Handle the availability array - convert to YYYY-MM-DD format
    if (updatedData.availability && Array.isArray(updatedData.availability)) {
      // Format dates to YYYY-MM-DD strings only
      updatedData.availability = updatedData.availability.map(date => {
        let dateObj;
        
        // Handle different possible date formats
        if (date && typeof date === 'object' && date.dateObject) {
          dateObj = new Date(date.dateObject);
        } else if (date && typeof date === 'object' && date.unix) {
          dateObj = new Date(date.unix * 1000);
        } else if (date) {
          dateObj = new Date(date);
        }
        
        // Return YYYY-MM-DD format only if valid date
        if (dateObj && !isNaN(dateObj.getTime())) {
          return dateObj.toISOString().split('T')[0]; // Returns "2025-03-25" format
        }
        return null;
      }).filter(date => date !== null); // Remove any null values
    }
    
    // Check if required fields are filled to set fullySignedUp
    const requiredFields = [
      updatedData.firstName,
      updatedData.lastName,
      updatedData.email,
      updatedData.phone,
      updatedData.dateOfBirth,
      updatedData.gender,
      updatedData.address1,
      updatedData.city1,
      updatedData.state1,
      updatedData.zipCode1
    ];
    
    const requiredFieldsFilled = requiredFields.every(field => Boolean(field)); // Check if all fields are truthy
    updatedData.fullySignedUp = requiredFieldsFilled;
    
    // Update the Database
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(volunteerId) }, // Filter to find the correct volunteer
      { $set: updatedData } // Update the document with the new data
    );
    
    // Handle the Response
    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Volunteer not found or no changes made" }); // Handle case where no document was updated
    }
    
    // Fetch the updated document to return to the client
    const updatedProfile = await db.collection("users").findOne({ _id: new ObjectId(volunteerId) });
    
    res.status(200).json({ 
      message: "Profile updated successfully", 
      volunteerProfile: updatedProfile 
    }); // Return success message with updated data
  } catch (error) {
    console.error("Error updating volunteer profile:", error); // Log any errors
    return res.status(500).json({ 
      message: "Error updating volunteer profile", 
      error: error.message 
    }); // Return error response
  }
};

// Export the controller functions
module.exports = {
  getVolunteerProfile,
  updateVolunteerProfile
};