// testConnection.js
const connectDB = require("../db"); // Adjust the path as necessary

const testConnection = async () => {
  try {
    const db = await connectDB(); // Attempt to connect to the database
    console.log("Database connection successful!");

    // Optionally, you can perform a simple query to verify the connection
    const collections = await db.listCollections().toArray();
    console.log("Collections in the database:", collections);

    // Close the connection if needed
    // await db.client.close(); // Uncomment if you want to close the connection
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};

testConnection();