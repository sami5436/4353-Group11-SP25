const request = require("supertest");
const { ObjectId } = require("mongodb");
const app = require("../server");

// Mock the database connection
jest.mock("../db", () => {
  return jest.fn().mockImplementation(() => {
    return Promise.resolve({
      collection: jest.fn().mockImplementation((collectionName) => {
        return {
          findOne: jest.fn(),
          find: jest.fn(),
          updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 })
        };
      })
    });
  });
});

const connectDB = require("../db");

describe("Volunteer Profile API", () => {
  let mockDb;
  let mockUsersCollection;
  
  // Using a valid MongoDB ObjectId format
  const testVolunteerId = new ObjectId().toString();
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup mock collections
    mockUsersCollection = {
      findOne: jest.fn(),
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 })
    };
    
    // Setup mock database
    mockDb = {
      collection: jest.fn().mockImplementation((name) => {
        if (name === 'users') return mockUsersCollection;
        return null;
      })
    };
    
    // Mock the DB promise resolution
    connectDB.mockResolvedValue(mockDb);
    
    // Mock console.log and console.error to reduce test noise
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it("should fetch the volunteer profile", async () => {
    // Mock volunteer data
    const mockVolunteer = {
      _id: new ObjectId(testVolunteerId),
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "123-456-7890"
    };
    
    // Setup mock to return volunteer data
    mockUsersCollection.findOne.mockResolvedValue(mockVolunteer);
    
    const res = await request(app).get(`/api/volunteerProfile/volunteer/${testVolunteerId}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("firstName", "John");
    expect(res.body).toHaveProperty("lastName", "Doe");
    expect(res.body).toHaveProperty("email", "john.doe@example.com");
    
    // Verify the database was called correctly
    expect(mockDb.collection).toHaveBeenCalledWith("users");
    expect(mockUsersCollection.findOne).toHaveBeenCalledWith({ _id: new ObjectId(testVolunteerId) });
  });

  it("should return 404 when volunteer not found", async () => {
    // Setup mock to return null (volunteer not found)
    mockUsersCollection.findOne.mockResolvedValue(null);
    
    const res = await request(app).get(`/api/volunteerProfile/volunteer/${testVolunteerId}`);
    
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("message", "Volunteer not found");
  });

  it("should return 500 on database error during fetch", async () => {
    // Setup mock to throw an error
    mockUsersCollection.findOne.mockRejectedValue(new Error("Database error"));
    
    const res = await request(app).get(`/api/volunteerProfile/volunteer/${testVolunteerId}`);
    
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("message", "Error retrieving volunteer profile");
  });

  it("should update the volunteer profile with valid data", async () => {
    // Updated volunteer data
    const updatedProfile = {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@example.com",
      phone: "123-456-7890",
      dateOfBirth: "1990-01-01",
      gender: "female",
      address1: "123 Main St",
      city1: "Anytown",
      state1: "CA",
      zipCode1: "12345",
      skills: ["First Aid", "Teaching"],
      availability: ["2023-01-01", "2023-01-02"],
      preferences: "Remote work"
    };
    
    // Mock the updated volunteer that will be returned after update
    const updatedVolunteer = {
      _id: new ObjectId(testVolunteerId),
      ...updatedProfile,
      fullySignedUp: true
    };
    
    // Setup mocks
    mockUsersCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });
    mockUsersCollection.findOne.mockResolvedValue(updatedVolunteer);
    
    const res = await request(app)
      .put(`/api/volunteerProfile/volunteer/${testVolunteerId}`)
      .send(updatedProfile);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Profile updated successfully");
    expect(res.body.volunteerProfile.firstName).toBe(updatedProfile.firstName);
    
    // Verify database was called correctly
    expect(mockDb.collection).toHaveBeenCalledWith("users");
    expect(mockUsersCollection.updateOne).toHaveBeenCalledWith(
      { _id: new ObjectId(testVolunteerId) },
      { $set: expect.any(Object) }
    );
  });

  it("should return 404 if volunteer not found during update", async () => {
    // Mock update to indicate no documents matched
    mockUsersCollection.updateOne.mockResolvedValue({ modifiedCount: 0 });
    
    const res = await request(app)
      .put(`/api/volunteerProfile/volunteer/${testVolunteerId}`)
      .send({
        firstName: "Jane",
        lastName: "Doe",
        email: "jane.doe@example.com"
      });
    
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Volunteer not found or no changes made");
  });

  it("should return 500 on database error during update", async () => {
    // Mock update to throw an error
    mockUsersCollection.updateOne.mockRejectedValue(new Error("Database error"));
    
    const res = await request(app)
      .put(`/api/volunteerProfile/volunteer/${testVolunteerId}`)
      .send({
        firstName: "Jane",
        lastName: "Doe",
        email: "jane.doe@example.com"
      });
    
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Error updating volunteer profile");
  });

  it("should not update the volunteer profile with invalid email", async () => {
    const invalidProfile = {
      firstName: "Jane",
      lastName: "Doe",
      email: "invalid-email",
      phone: "123-456-7890",
      dateOfBirth: "1990-01-01",
      gender: "female",
      address1: "123 Main St",
      city1: "Anytown",
      state1: "CA",
      zipCode1: "12345"
    };
    
    const res = await request(app)
      .put(`/api/volunteerProfile/volunteer/${testVolunteerId}`)
      .send(invalidProfile);
    
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
    
    const res = await request(app)
      .put(`/api/volunteerProfile/volunteer/${testVolunteerId}`)
      .send(incompleteProfile);
    
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toContain("All primary address fields are required.");
  });

  it("should not update the volunteer profile with future date of birth", async () => {
    const futureProfile = {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@example.com",
      phone: "123-456-7890",
      dateOfBirth: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // Tomorrow's date
      gender: "female",
      address1: "123 Main St",
      city1: "Anytown",
      state1: "CA",
      zipCode1: "12345"
    };
    
    const res = await request(app)
      .put(`/api/volunteerProfile/volunteer/${testVolunteerId}`)
      .send(futureProfile);
    
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toContain("Date of birth cannot be in the future.");
  });

  it("should handle formatting of availability dates", async () => {
    // Updated profile with different date formats
    const updatedProfile = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "123-456-7890",
      dateOfBirth: "1990-01-01",
      gender: "male",
      address1: "123 Main St",
      city1: "Anytown",
      state1: "CA",
      zipCode1: "12345",
      availability: [
        "2023-06-01", // String format
        { dateObject: "2023-06-02T00:00:00.000Z" }, // Object with dateObject
        { unix: 1685750400 } // Object with unix timestamp (June 3, 2023)
      ]
    };
    
    // Mock the updated volunteer
    const updatedVolunteer = {
      _id: new ObjectId(testVolunteerId),
      ...updatedProfile,
      availability: ["2023-06-01", "2023-06-02", "2023-06-03"],
      fullySignedUp: true
    };
    
    // Setup mocks
    mockUsersCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });
    mockUsersCollection.findOne.mockResolvedValue(updatedVolunteer);
    
    const res = await request(app)
      .put(`/api/volunteerProfile/volunteer/${testVolunteerId}`)
      .send(updatedProfile);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.volunteerProfile.availability).toContain("2023-06-01");
    expect(res.body.volunteerProfile.availability).toContain("2023-06-02");
    expect(res.body.volunteerProfile.availability).toContain("2023-06-03");
  });

  it("should check fullySignedUp status based on required fields", async () => {
    // Updated profile with all required fields
    const updatedProfile = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "123-456-7890",
      dateOfBirth: "1990-01-01",
      gender: "male",
      address1: "123 Main St",
      city1: "Anytown",
      state1: "CA",
      zipCode1: "12345"
    };
    
    // Mock the updated volunteer
    const updatedVolunteer = {
      _id: new ObjectId(testVolunteerId),
      ...updatedProfile,
      fullySignedUp: true
    };
    
    // Setup mocks
    mockUsersCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });
    mockUsersCollection.findOne.mockResolvedValue(updatedVolunteer);
    
    const res = await request(app)
      .put(`/api/volunteerProfile/volunteer/${testVolunteerId}`)
      .send(updatedProfile);
    
    expect(res.statusCode).toBe(200);
    expect(res.body.volunteerProfile.fullySignedUp).toBe(true);
  });

  it("should validate phone number format", async () => {
    // Updated profile with invalid phone format
    const updatedProfile = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "1234567890", // Missing hyphens
      dateOfBirth: "1990-01-01",
      gender: "male",
      address1: "123 Main St",
      city1: "Anytown",
      state1: "CA",
      zipCode1: "12345"
    };
    
    const res = await request(app)
      .put(`/api/volunteerProfile/volunteer/${testVolunteerId}`)
      .send(updatedProfile);
    
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toContain("Phone number must be in the format xxx-xxx-xxxx.");
  });

  it("should validate city format", async () => {
    // Updated profile with invalid city (numbers in name)
    const updatedProfile = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "123-456-7890",
      dateOfBirth: "1990-01-01",
      gender: "male",
      address1: "123 Main St",
      city1: "Anytown123", // Contains numbers
      state1: "CA",
      zipCode1: "12345"
    };
    
    const res = await request(app)
      .put(`/api/volunteerProfile/volunteer/${testVolunteerId}`)
      .send(updatedProfile);
    
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toContain("Primary city must contain only letters.");
  });

  it("should validate zipCode format", async () => {
    // Updated profile with invalid zip code (too short)
    const updatedProfile = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "123-456-7890",
      dateOfBirth: "1990-01-01",
      gender: "male",
      address1: "123 Main St",
      city1: "Anytown",
      state1: "CA",
      zipCode1: "1234" // Only 4 digits
    };
    
    const res = await request(app)
      .put(`/api/volunteerProfile/volunteer/${testVolunteerId}`)
      .send(updatedProfile);
    
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toContain("Primary zip code must contain integers and be exactly 5 digits.");
  });

  it("should validate secondary address fields", async () => {
    // Updated profile with incomplete secondary address
    const updatedProfile = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "123-456-7890",
      dateOfBirth: "1990-01-01",
      gender: "male",
      address1: "123 Main St",
      city1: "Anytown",
      state1: "CA",
      zipCode1: "12345",
      address2: "456 Second St", 
      // Missing city2, state2, zipCode2
    };
    
    const res = await request(app)
      .put(`/api/volunteerProfile/volunteer/${testVolunteerId}`)
      .send(updatedProfile);
    
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toContain("All secondary address fields must be provided if any are present.");
  });
});