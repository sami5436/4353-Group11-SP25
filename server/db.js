require("dotenv").config(); 
const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = process.env.MONGO_URI;

if (!uri) {
  console.error("MONGO_URI is not defined! Check your .env file.");
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB successfully!");
    return client.db("volunteerDB"); 
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}

module.exports = connectDB;
