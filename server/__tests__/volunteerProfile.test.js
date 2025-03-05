const request = require("supertest");
const app = require("../server");

describe("Volunteer Profile API", () => {
  it("should fetch the volunteer profile", async () => {
    const res = await request(app).get("/api/volunteerProfile");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("firstName");
    expect(res.body).toHaveProperty("lastName");
    expect(res.body).toHaveProperty("email");
  });

  it("should update the volunteer profile with valid data", async () => {
    const updatedProfile = {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@example.com",
      phone: "123-456-7890",
      dateOfBirth: "1990-01-01",
      address1: "123 Main St",
      city1: "Anytown",
      state1: "CA",
      zipCode1: "12345",
      address2: "456 Side St",
      city2: "Othertown",
      state2: "CA",
      zipCode2: "67890",
      skills: ["First Aid", "Teaching"],
      availability: "Weekends",
      preferences: "Remote work"
    };

    const res = await request(app).put("/api/volunteerProfile").send(updatedProfile);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Profile updated successfully");
    expect(res.body.volunteerProfile.firstName).toBe(updatedProfile.firstName);
  });

  it("should not update the volunteer profile with invalid email", async () => {
    const invalidProfile = {
      firstName: "Jane",
      lastName: "Doe",
      email: "invalid-email",
      phone: "123-456-7890",
      address1: "123 Main St",
      city1: "Anytown",
      state1: "CA",
      zipCode1: "12345"
    };

    const res = await request(app).put("/api/volunteerProfile").send(invalidProfile);
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toContain("Email must be in a valid format (e.g., user@example.com).");
  });

  it("should not update the volunteer profile with missing required fields", async () => {
    const incompleteProfile = {
      firstName: "Jane",
      lastName: "Doe",
      city1: "Anytown",
      state1: "CA"
      // Missing required fields like address1, zipCode1, etc.
    };

    const res = await request(app).put("/api/volunteerProfile").send(incompleteProfile);
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toContain("All primary address fields are required.");
  });

  it("should not update the volunteer profile with future date of birth", async () => {
    const futureProfile = {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@example.com",
      dateOfBirth: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // Tomorrow's date
      address1: "123 Main St",
      city1: "Anytown",
      state1: "CA",
      zipCode1: "12345"
    };

    const res = await request(app).put("/api/volunteerProfile").send(futureProfile);
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toContain("Date of birth cannot be in the future.");
  });
});
