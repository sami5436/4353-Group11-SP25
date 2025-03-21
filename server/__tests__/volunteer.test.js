const request = require("supertest");
const app = require("../server"); 
const connectDB = require("../db");
const { ObjectId } = require("mongodb");

let db;
let client;

beforeAll(async () => {
  const connection = await connectDB();
  client = connection.client;
  db = connection.db;
});

afterAll(async () => {
  if (client) await client.close();
});

it("should return all events associated with a valid volunteer ID", async () => {
    // Insert a test volunteer
    const volunteerId = new ObjectId();
    await db.collection("users").insertOne({
      _id: volunteerId,
      name: "Test Volunteer",
      zipCode: "12345",
      skills: ["medical", "logistics"],
      availability: "2025-06-01",
    });
  
    // Insert related events
    await db.collection("events").insertMany([
      {
        name: "Beach Cleanup",
        volunteers: [volunteerId.toString()],
        status: "Upcoming",
      },
      {
        name: "Park Maintenance",
        volunteers: [volunteerId.toString()],
        status: "Completed",
      },
    ]);
  
    const res = await request(app).get(`/api/volunteers/volunteer/${volunteerId}`);
  
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body.every(event => event.volunteered === true)).toBe(true);
  });
  