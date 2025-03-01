const request = require("supertest");
const app = require("../server");

describe("Event fetcher API for volunteer history", () => {
  
  it("should return all events", async () => {
    const res = await request(app).get("/api/volunteerHistory");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("should add a new event", async () => {
    const newEvent = {
      name: "Test Event",
      date: "2024-06-01",
      city: "Test City",
      state: "TX",
      address: "789 Test St",
      status: "Upcoming",
      description: "A test event for validation",
      volunteered: false,
      volunteers: [] // Ensure volunteers array is initialized
    };

    const res = await request(app).post("/api/volunteerHistory").send(newEvent);
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe(newEvent.name);
  });

  it("should not add an event with missing fields", async () => {
    const invalidEvent = {
      name: "Incomplete Event",
      city: "Test City",
    };

    const res = await request(app).post("/api/volunteerHistory").send(invalidEvent);
    expect(res.statusCode).toBe(400);
  });

  it("should fetch all volunteers", async () => {
    const res = await request(app).get("/api/volunteerHistory/volunteers");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should add a volunteer to an event", async () => {
    // Create an event first
    const newEvent = {
      name: "Volunteer Test Event",
      date: "2024-06-10",
      city: "New City",
      state: "TX",
      address: "123 New St",
      status: "Upcoming",
      description: "Event to test adding volunteers",
      volunteered: false,
      volunteers: []
    };

    const eventRes = await request(app).post("/api/volunteerHistory").send(newEvent);
    expect(eventRes.statusCode).toBe(201);
    const eventId = eventRes.body.id;

    // Add a volunteer to the created event
    const newVolunteer = {
      eventId,
      volunteerName: "John Doe",
      volunteerEmail: "johndoe@example.com"
    };

    const volunteerRes = await request(app).post("/api/volunteerHistory/addVolunteer").send(newVolunteer);
    expect(volunteerRes.statusCode).toBe(201);
    expect(volunteerRes.body.name).toBe(newVolunteer.volunteerName);
  });
});
