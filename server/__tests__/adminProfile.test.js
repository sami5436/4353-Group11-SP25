const request = require("supertest");
const { ObjectId } = require("mongodb");

jest.mock("../db", () => {
  const { ObjectId } = require("mongodb");

  return jest.fn().mockImplementation(() => {
    return Promise.resolve({
      collection: jest.fn().mockImplementation((collectionName) => {
        return {
          findOne: jest.fn().mockResolvedValue({
            _id: new ObjectId("67dcf07d20227aed7bc5ac48"),
            fullName: "John Doe",
            adminId: "ADMIN123",
            email: "john.doe@example.com",
            phone: "123-456-7890"
          }),
          updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 })
        };
      })
    });
  });
});

const app = require("../server");
const connectDB = require("../db");

const adminRoutes = require("../routes/adminProfile");
const adminProfileController = require("../controllers/adminProfile");

describe("Admin Profile API", () => {
  let db;
  
  beforeAll(async () => {
    // Initialize mock DB
    const connection = await connectDB();
    db = connection;
  });
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it("should fetch admin profile data", async () => {
    // Spy on the controller method
    const spy = jest.spyOn(adminProfileController, "getAdminProfile");
    
    // Send request with cookie
    const res = await request(app)
      .get("/api/adminProfile")
      .set("Cookie", "userId=67dcf07d20227aed7bc5ac48");
    
    // Assert the response
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("fullName");
    expect(res.body).toHaveProperty("adminId");
    expect(res.body).toHaveProperty("email");
    expect(spy).toHaveBeenCalled();
  });

  it("should return 401 if no user ID is in cookies", async () => {
    // Send request without cookie
    const res = await request(app)
      .get("/api/adminProfile");
    
    // Assert unauthorized response
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Unauthorized: No user ID found in cookies get");
  });

  it("should update admin profile data", async () => {
    // Spy on the controller method
    const spy = jest.spyOn(adminProfileController, "updateAdminProfile");
    
    const updatedProfile = {
      fullName: "John Smith",
      email: "john.smith@example.com",
      phone: "123-456-7890",
      emergencyContact: "Jane Smith",
      emergencyPhone: "111-222-3333"
    };
    
    // Send update request
    const res = await request(app)
      .put("/api/adminProfile")
      .send(updatedProfile)
      .set("Cookie", "userId=67dcf07d20227aed7bc5ac48");
    
    // Assert the response
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("fullName");
    expect(res.body).toHaveProperty("email");
    expect(spy).toHaveBeenCalled();
  });

  it("should return 404 if admin not found", async () => {
    // Override the findOne mock to return null
    db.collection().findOne.mockResolvedValueOnce(null);
    
    // Send request with valid cookie but non-existent user
    const res = await request(app)
      .put("/api/adminProfile")
      .send({
        fullName: "John Smith",
        email: "john.smith@example.com"
      })
      .set("Cookie", "userId=67dcf07d20227aed7bc5ac48");
    
    // Assert not found response
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Admin not found");
  });

  it("should return 400 if required fields are missing", async () => {
    // Send request with invalid data
    const res = await request(app)
      .put("/api/adminProfile")
      .send({
        fullName: "",
        email: "not-an-email"
      })
      .set("Cookie", "userId=67dcf07d20227aed7bc5ac48");
    
    // Assert validation error
    expect(res.statusCode).toBe(400);
  });

  it("should handle errors during the update operation", async () => {
    // Override the updateOne mock to throw an error
    db.collection().updateOne.mockRejectedValueOnce(new Error("Database error"));
    
    // Send update request
    const res = await request(app)
      .put("/api/adminProfile")
      .send({
        fullName: "John Smith", 
        email: "john.smith@example.com",
        phone: "123-456-7890",
        emergencyContact: "Jane Smith",
        emergencyPhone: "111-222-3333"
      })
      .set("Cookie", "userId=67dcf07d20227aed7bc5ac48");
    
    // Assert error response
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Error updating admin profile");
  });

  // Additional tests for coverage
  it("should return 500 if there is an error fetching the admin profile", async () => {
    // Override findOne to throw an error
    db.collection().findOne.mockRejectedValueOnce(new Error("Database error"));
    
    // Send get request
    const res = await request(app)
      .get("/api/adminProfile")
      .set("Cookie", "userId=67dcf07d20227aed7bc5ac48");
    
    // Assert error response
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Error retrieving admin profile");
  });

  it("should handle ObjectId conversion errors", async () => {
    // Send request with invalid userId format
    const res = await request(app)
      .get("/api/adminProfile")
      .set("Cookie", "userId=invalid-id");
    
    // Assert error response
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toContain("input must be a 24 character hex string");
  });

  it("should verify fullySignedUp flag is set when all required fields are provided", async () => {
    // Complete profile data
    const completeProfile = {
      fullName: "John Complete",
      email: "john.complete@example.com",
      phone: "123-456-7890",
      emergencyContact: "Jane Complete",
      emergencyPhone: "987-654-3210"
    };
    
    // Send update request with complete data
    const res = await request(app)
      .put("/api/adminProfile")
      .send(completeProfile)
      .set("Cookie", "userId=67dcf07d20227aed7bc5ac48");
    
    // Assert response has fullySignedUp flag
    expect(res.statusCode).toBe(200);
    expect(res.body.fullySignedUp).toBe(true);
  });

  it("should handle validation of phone numbers", async () => {
    // Invalid phone number format
    const profileWithInvalidPhone = {
      fullName: "John Smith",
      email: "john.smith@example.com",
      phone: "invalid-phone",
      emergencyContact: "Jane Smith",
      emergencyPhone: "also-invalid"
    };
    
    // Send update request with invalid phone
    const res = await request(app)
      .put("/api/adminProfile")
      .send(profileWithInvalidPhone)
      .set("Cookie", "userId=67dcf07d20227aed7bc5ac48");
    
    // Assert validation error
    expect(res.statusCode).toBe(400);
  });
});