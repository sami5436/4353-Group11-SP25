const request = require("supertest");
const app = require("../server");

describe("Volunteer Assignments API", () => {
  
  it("should return all volunteer assignments", async () => {
    const res = await request(app).get("/api/assignments");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("should return assignments filtered by volunteer ID", async () => {
    const volunteerId = "volunteer-1";
    const res = await request(app).get(`/api/assignments?volunteerId=${volunteerId}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.every(event => 
      event.volunteers.some(v => v.id === volunteerId)
    )).toBe(true);
  });

  it("should return 400 if volunteer ID is missing", async () => {
    const res = await request(app).get("/api/assignments");
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Volunteer ID is required");
  });

  it("should return 404 if no assignments exist for a volunteer", async () => {
    const res = await request(app).get("/api/assignments?volunteerId=nonexistent-volunteer");
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("No events found for this volunteer.");
  });
});
