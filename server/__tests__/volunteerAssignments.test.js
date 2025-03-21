const request = require("supertest");
const app = require("../server");
const connectDB = require("../db");
const { ObjectId } = require("mongodb");

let client;
let db;

beforeAll(async () => {
  const connection = await connectDB();
  client = connection.client;
  db = connection.db;
});

afterAll(async () => {
  if (client) await client.close();
});

describe("Volunteer Assignments API", () => {
  const hardcodedVolunteerId = "67dcbc9f29c1f3edd65b52f7";

  describe("Assign Volunteer API", () => {
    it("should assign a volunteer to a suitable event", async () => {
      const res = await request(app).post("/api/volunteerAssignments/assignVolunteer");

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "Volunteer assigned successfully");
      expect(res.body).toHaveProperty("event");
      expect(res.body.event).toHaveProperty("volunteered", true);
    });

    it("should return 400 if volunteer is already assigned to the event", async () => {
      // Assign the volunteer once (if not already assigned)
      await request(app).post("/api/volunteerAssignments/assignVolunteer");

      // Try assigning the same volunteer again
      const res = await request(app).post("/api/volunteerAssignments/assignVolunteer");

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error", "Volunteer already assigned to this event");
    });

    it("should return 400 if volunteer data is incomplete", async () => {
      const tempVolunteerId = new ObjectId();
      await db.collection("users").insertOne({
        _id: tempVolunteerId,
        name: "Incomplete Volunteer",
        zipCode: "12345" // No skills or availability
      });

      await db.collection("users").updateOne(
        { _id: new ObjectId(hardcodedVolunteerId) },
        {
          $set: {
            zipCode: "12345"
          },
          $unset: {
            skills: "",
            availability: ""
          }
        }
      );

      const res = await request(app).post("/api/volunteerAssignments/assignVolunteer");

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error", "Volunteer data is incomplete");

      // Restore original volunteer data (if needed in future)
      await db.collection("users").updateOne(
        { _id: new ObjectId(hardcodedVolunteerId) },
        {
          $set: {
            // Replace with original data values as appropriate
            skills: ["medical", "first-aid"],
            availability: "2025-04-01"
          }
        }
      );

      await db.collection("users").deleteOne({ _id: tempVolunteerId });
    });

    it("should return 404 if no suitable event is found", async () => {
      await db.collection("users").updateOne(
        { _id: new ObjectId(hardcodedVolunteerId) },
        {
          $set: {
            zipCode: "00000", // unlikely to match
            skills: ["no_matching_skill"],
            availability: "2100-01-01"
          }
        }
      );

      const res = await request(app).post("/api/volunteerAssignments/assignVolunteer");

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error", "No suitable event found");
    });
  });

  it("should return assignments filtered by volunteer ID", async () => {
    const volunteerId = hardcodedVolunteerId;

    const volunteerExists = await db.collection("users").findOne({ _id: new ObjectId(volunteerId) });
    if (!volunteerExists) {
      console.warn(`Skipping test: Volunteer ${volunteerId} does not exist in DB.`);
      return;
    }

    const res = await request(app).get(`/api/volunteerAssignments?volunteerId=${volunteerId}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.every(event =>
      event.volunteers.includes(volunteerId)
    )).toBe(true);
  });

  it("should return 400 if volunteer ID is missing", async () => {
    const res = await request(app).get("/api/volunteerAssignments");
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Volunteer ID is required");
  });

  it("should return 404 if no assignments exist for a volunteer", async () => {
    const fakeId = "000000000000000000000000";
    const res = await request(app).get(`/api/volunteerAssignments?volunteerId=${fakeId}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("Volunteer not found");
  });
});
