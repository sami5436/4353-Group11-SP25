const request = require("supertest");
const app = require("../server");

describe("Event fetcher API for volunteer history", () => {
  
  it("should return all events", async () => {
    const res = await request(app).get("/api/events/history");
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
      volunteers: [], // Ensure volunteers array is initialized
      skills: ["First Aid & CPR", "Public Speaking"], // Ensure skills are included
    };

    const res = await request(app).post("/api/events").send(newEvent);
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe(newEvent.name);
    expect(res.body.skills).toEqual(expect.arrayContaining(newEvent.skills));
  });

  it("should not add an event with missing fields", async () => {
    const invalidEvent = {
      name: "Incomplete Event",
      city: "Test City",
      skills: [], // Ensuring that an empty array doesn't break validation
    };

    const res = await request(app).post("/api/events").send(invalidEvent);
    expect(res.statusCode).toBe(400);
  });

  it("should fetch all volunteers", async () => {
    const res = await request(app).get("/api/events/volunteers");
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
      volunteers: [],
      skills: ["Technical Support", "Event Coordination"], // Skills added
    };

    const eventRes = await request(app).post("/api/events").send(newEvent);
    expect(eventRes.statusCode).toBe(201);
    const eventId = eventRes.body.id;

    // Add a volunteer to the created event
    const newVolunteer = {
      eventId,
      volunteerName: "John Doe",
      volunteerEmail: "johndoe@example.com",
    };

    const volunteerRes = await request(app).post("/api/events/addVolunteer").send(newVolunteer);
    expect(volunteerRes.statusCode).toBe(201);
    expect(volunteerRes.body.name).toBe(newVolunteer.volunteerName);
  });
});
describe("Volunteer History API - Additional Test Cases", () => {
  let eventId;

  beforeAll(async () => {
    // Create an event to update later
    const eventRes = await request(app).post("/api/events").send({
      name: "Test Update Event",
      date: "2024-07-01",
      city: "Test City",
      state: "TX",
      address: "123 Test Ave",
      status: "Upcoming",
      description: "Event for testing update functionality",
      volunteered: false,
      skills: ["Organization", "Leadership"],
    });
    eventId = eventRes.body.id;
  });

  it("should update an existing event", async () => {
    const updatedEvent = {
      name: "Updated Event Name",
      status: "Completed",
    };

    const res = await request(app).put(`/api/events/${eventId}`).send(updatedEvent);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe(updatedEvent.name);
    expect(res.body.status).toBe(updatedEvent.status);
  });

  it("should return 404 for updating a non-existent event", async () => {
    const res = await request(app).put("/api/events/9999").send({
      name: "Non-existent Event",
    });
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Event not found");
  });

  it("should not add a volunteer to a non-existent event", async () => {
    const newVolunteer = {
      eventId: 9999, // Non-existent ID
      volunteerName: "Jane Doe",
      volunteerEmail: "jane@example.com",
    };

    const res = await request(app).post("/api/events/addVolunteer").send(newVolunteer);
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Event not found");
  });

  it("should not update an event with invalid data", async () => {
    const res = await request(app).put(`/api/events/${eventId}`).send({
      name: "",
      status: 1234, // Invalid status type
    });
    expect(res.statusCode).toBe(400);
  });
});
