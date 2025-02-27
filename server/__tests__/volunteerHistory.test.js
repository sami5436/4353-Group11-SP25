const request = require("supertest");
const app = require("../server");

describe("Event fetcher API for volunteer history", () => {
  it("should return all events", async () => {
    const res = await request(app).get("/api/volunteerHistory");
    expect(res.statusCode).toBe(200);
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
});
