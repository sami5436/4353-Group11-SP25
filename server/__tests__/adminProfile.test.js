const request = require("supertest");
const app = require("../server");

describe("Admin Profile API", () => {
  it("should fetch admin profile data", async () => {
    const res = await request(app).get("/api/adminProfile");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("fullName");
    expect(res.body).toHaveProperty("adminId");
    expect(res.body).toHaveProperty("email");
  });

  it("should update admin profile data", async () => {
    const updatedProfile = {
      fullName: "John Smith",
      email: "john.smith@example.com",
      phone: "123-456-7890",
      emergencyContact: "Jane Smith",
      emergencyPhone: "111-222-3333"
    };

    const res = await request(app).put("/api/adminProfile").send(updatedProfile);
    expect(res.statusCode).toBe(200);
    expect(res.body.fullName).toBe(updatedProfile.fullName);
    expect(res.body.email).toBe(updatedProfile.email);
  });

  it("should not update with invalid data", async () => {
    const invalidProfile = {
      fullName: "",
      email: "not-an-email"
    };

    const res = await request(app).put("/api/adminProfile").send(invalidProfile);
    expect(res.statusCode).toBe(400);
  });
});