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

describe("Admin Profile API", () => {
  it("should fetch admin profile data", async () => {
    const res = await request(app).get("/api/adminProfile");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("fullName");
    expect(res.body).toHaveProperty("adminId");
    expect(res.body).toHaveProperty("email");
  });

  it("should return 500 if there is an error fetching the admin profile", async () => {
    const mockFindOne = jest.fn().mockImplementation(() => {
      throw new Error("Database connection failed");
    });

    db.collection = jest.fn().mockReturnValue({
      findOne: mockFindOne,
    });

    const res = await request(app).get("/api/adminProfile");

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Error retrieving admin profile");
  });

  it("should update admin profile data", async () => {
    const updatedProfile = {
      fullName: "John Smith",
      email: "john.smith@example.com",
      phone: "123-456-7890",
      emergencyContact: "Jane Smith",
      emergencyPhone: "111-222-3333",
    };

    const res = await request(app)
      .put("/api/adminProfile")
      .send(updatedProfile)
      .set("Cookie", "userId=mockedUserId");

    expect(res.statusCode).toBe(200);
    expect(res.body.fullName).toBe(updatedProfile.fullName);
    expect(res.body.email).toBe(updatedProfile.email);
  });

  it("should return 401 if no user ID is in cookies", async () => {
    const updatedProfile = {
      fullName: "John Smith",
      email: "john.smith@example.com",
    };

    const res = await request(app)
      .put("/api/adminProfile")
      .send(updatedProfile);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Unauthorized: No user ID found in cookies update");
  });

  it("should return 404 if admin not found", async () => {
    const mockFindOne = jest.fn().mockResolvedValue(null); 
    db.collection = jest.fn().mockReturnValue({
      findOne: mockFindOne,
    });

    const updatedProfile = {
      fullName: "John Smith",
      email: "john.smith@example.com",
    };

    const res = await request(app)
      .put("/api/adminProfile")
      .send(updatedProfile)
      .set("Cookie", "userId=mockedUserId"); 

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Admin not found");
  });

  it("should return 400 if required fields are missing", async () => {
    const invalidProfile = {
      fullName: "",
      email: "not-an-email",
    };

    const res = await request(app)
      .put("/api/adminProfile")
      .send(invalidProfile)
      .set("Cookie", "userId=mockedUserId"); 

    expect(res.statusCode).toBe(400);
  });

  it("should handle errors during the update operation", async () => {
    const mockUpdateOne = jest.fn().mockImplementation(() => {
      throw new Error("Database update failed");
    });

    db.collection = jest.fn().mockReturnValue({
      updateOne: mockUpdateOne,
    });

    const updatedProfile = {
      fullName: "John Smith",
      email: "john.smith@example.com",
    };

    const res = await request(app)
      .put("/api/adminProfile")
      .send(updatedProfile)
      .set("Cookie", "userId=mockedUserId"); 

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Error updating admin profile");
  });
});
