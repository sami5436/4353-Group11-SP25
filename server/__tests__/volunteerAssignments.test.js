const request = require("supertest");
const { MongoClient, ObjectId } = require("mongodb");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../server");

// Mock the database connection
jest.mock("../db", () => {
  return jest.fn().mockImplementation(() => {
    return Promise.resolve({
      collection: jest.fn().mockImplementation((collectionName) => {
        return {
          findOne: jest.fn(),
          updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 })
        };
      })
    });
  });
});

const connectDB = require("../db");

describe("Volunteer Assignment Tests", () => {
  let mockDb;
  let mockVolunteersCollection;
  let mockEventsCollection;
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup mock collections
    mockVolunteersCollection = {
      findOne: jest.fn()
    };
    
    mockEventsCollection = {
      findOne: jest.fn(),
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 })
    };
    
    // Setup mock database
    mockDb = {
      collection: jest.fn().mockImplementation((name) => {
        if (name === 'users') return mockVolunteersCollection;
        if (name === 'events') return mockEventsCollection;
        return null;
      })
    };
    
    // Mock the DB promise resolution
    connectDB.mockResolvedValue(mockDb);
  });

  test("Should successfully assign volunteer to matching event", async () => {
    // Arrange
    const volunteerId = "67dcf07d20227aed7bc5ac48";
    const volunteerId_ObjectId = new ObjectId(volunteerId);
    
    const mockVolunteer = {
      _id: volunteerId_ObjectId,
      firstName: "John",
      lastName: "Doe",
      zipCode1: "77494",
      skills: ["cooking", "teaching"],
      availability: ["2024-06-01"]
    };
    
    const mockEvent = {
      _id: new ObjectId("67dce403deb657df9900d5a7"),
      name: "Test Event",
      date: "2024-06-01",
      zipCode: "77494",
      skills: ["cooking", "cleaning"],
      volunteers: []
    };
    
    const updatedEvent = {
      ...mockEvent,
      volunteers: [volunteerId]
    };
    
    // Setup the mock responses
    mockVolunteersCollection.findOne.mockResolvedValue(mockVolunteer);
    mockEventsCollection.findOne
      .mockResolvedValueOnce(mockEvent) // First call: matching event
      .mockResolvedValueOnce(updatedEvent); // Second call: updated event
  
    // Act
    const response = await request(app)
      .post(`/api/volunteerAssignments/assignVolunteer/${volunteerId}`)
      .send();
    
    // Assert
    expect(response.status).toBe(200);
    expect(response.body.message).toContain("successfully");
    expect(response.body.event.volunteers).toContain(volunteerId);
    expect(mockEventsCollection.updateOne).toHaveBeenCalledWith(
      { _id: mockEvent._id },
      { $push: { volunteers: volunteerId } }
    );
  });

  test("Should assign volunteer to fallback event when no matching event found", async () => {
    // Arrange
    const volunteerId = "67dcf07d20227aed7bc5ac48";
    const volunteerId_ObjectId = new ObjectId(volunteerId);
    const fallbackEventId = "67dce403deb657df9900d5a7";
    
    const mockVolunteer = {
      _id: volunteerId_ObjectId,
      firstName: "John",
      lastName: "Doe",
      zipCode1: "77494",
      skills: ["cooking", "teaching"],
      availability: ["2024-06-01"]
    };
    
    const fallbackEvent = {
      _id: new ObjectId(fallbackEventId),
      name: "Fallback Event",
      date: "2024-06-10",
      zipCode: "12345",
      skills: ["admin"],
      volunteers: []
    };
    
    const updatedEvent = {
      ...fallbackEvent,
      volunteers: [volunteerId]
    };
    
    // Setup the mock responses
    mockVolunteersCollection.findOne.mockResolvedValue(mockVolunteer);
    mockEventsCollection.findOne
      .mockResolvedValueOnce(null) // First call: no matching event
      .mockResolvedValueOnce(fallbackEvent) // Second call: fallback event
      .mockResolvedValueOnce(updatedEvent); // Third call: updated event
    
    // Act
    const response = await request(app)
      .post(`/api/volunteerAssignments/assignVolunteer/${volunteerId}`)
      .send();
    
    // Assert
    expect(response.status).toBe(200);
    expect(response.body.message).toContain("to fallback event");
    expect(mockEventsCollection.findOne).toHaveBeenCalledWith({ _id: new ObjectId(fallbackEventId) });
    expect(mockEventsCollection.updateOne).toHaveBeenCalled();
  });

  test("Should return 400 for invalid volunteer ID format", async () => {
    // Arrange
    const invalidVolunteerId = "invalid-id";
    
    // Act
    const response = await request(app)
      .post(`/api/volunteerAssignments/assignVolunteer/${invalidVolunteerId}`)
      .send();
    
    // Assert
    expect(response.status).toBe(400);
    expect(response.body.error).toContain("Invalid volunteer ID format");
  });

  test("Should return 404 when volunteer not found", async () => {
    // Arrange
    const nonExistentVolunteerId = "60dcf07d20227aed7bc5ac48"; // Valid format but doesn't exist
    
    // Setup mocks
    mockVolunteersCollection.findOne.mockResolvedValue(null);
    
    // Act
    const response = await request(app)
      .post(`/api/volunteerAssignments/assignVolunteer/${nonExistentVolunteerId}`)
      .send();
    
    // Assert
    expect(response.status).toBe(404);
    expect(response.body.error).toContain("Volunteer not found");
  });

  test("Should return 400 when volunteer data is incomplete", async () => {
    // Arrange
    const volunteerId = "67dcf07d20227aed7bc5ac48";
    const volunteerId_ObjectId = new ObjectId(volunteerId);
    
    const incompleteVolunteer = {
      _id: volunteerId_ObjectId,
      firstName: "John",
      lastName: "Doe"
      // Missing zipCode1, skills, and availability
    };
    
    // Setup mocks
    mockVolunteersCollection.findOne.mockResolvedValue(incompleteVolunteer);
    
    // Act
    const response = await request(app)
      .post(`/api/volunteerAssignments/assignVolunteer/${volunteerId}`)
      .send();
    
    // Assert
    expect(response.status).toBe(400);
    expect(response.body.error).toContain("Volunteer data is incomplete");
  });

  test("Should return 404 when fallback event not found", async () => {
    // Arrange
    const volunteerId = "67dcf07d20227aed7bc5ac48";
    const volunteerId_ObjectId = new ObjectId(volunteerId);
    
    const mockVolunteer = {
      _id: volunteerId_ObjectId,
      firstName: "John",
      lastName: "Doe",
      zipCode1: "77494",
      skills: ["cooking", "teaching"],
      availability: ["2024-06-01"]
    };
    
    // Setup the mock responses
    mockVolunteersCollection.findOne.mockResolvedValue(mockVolunteer);
    mockEventsCollection.findOne
      .mockResolvedValueOnce(null) // No matching event found
      .mockResolvedValueOnce(null); // No fallback event found
    
    // Act
    const response = await request(app)
      .post(`/api/volunteerAssignments/assignVolunteer/${volunteerId}`)
      .send();
    
    // Assert
    expect(response.status).toBe(404);
    expect(response.body.error).toContain("Fallback event not found");
  });

  test("Should prevent duplicate volunteer assignment", async () => {
    // Arrange
    const volunteerId = "67dcf07d20227aed7bc5ac48";
    const volunteerId_ObjectId = new ObjectId(volunteerId);
    
    const mockVolunteer = {
      _id: volunteerId_ObjectId,
      firstName: "John",
      lastName: "Doe",
      zipCode1: "77494",
      skills: ["cooking", "teaching"],
      availability: ["2024-06-01"]
    };
    
    const mockEvent = {
      _id: new ObjectId("67dce403deb657df9900d5a7"),
      name: "Test Event",
      date: "2024-06-01",
      zipCode: "77494",
      skills: ["cooking"],
      volunteers: ["67dcf07d20227aed7bc5ac48"] // Volunteer already assigned
    };
    
    // Setup the mock responses
    mockVolunteersCollection.findOne.mockResolvedValue(mockVolunteer);
    mockEventsCollection.findOne.mockResolvedValueOnce(mockEvent);
    
    // Act
    const response = await request(app)
      .post(`/api/volunteerAssignments/assignVolunteer/${volunteerId}`)
      .send();
    
    // Assert
    expect(response.status).toBe(400);
    expect(response.body.error).toContain("Volunteer already assigned to this event");
  });

  test("Should handle database errors gracefully", async () => {
    // Arrange
    const volunteerId = "67dcf07d20227aed7bc5ac48";
    
    // Setup mock to throw an error
    connectDB.mockRejectedValue(new Error("Database connection failed"));
    
    // Act
    const response = await request(app)
      .post(`/api/volunteerAssignments/assignVolunteer/${volunteerId}`)
      .send();
    
    // Assert
    expect(response.status).toBe(500);
    expect(response.body.error).toContain("Error assigning volunteer");
  });

  // Add more tests to increase coverage
  
  test("Should handle race conditions in volunteer assignment", async () => {
    // Arrange
    const volunteerId = "67dcf07d20227aed7bc5ac48";
    const volunteerId_ObjectId = new ObjectId(volunteerId);
    
    const mockVolunteer = {
      _id: volunteerId_ObjectId,
      firstName: "John",
      lastName: "Doe",
      zipCode1: "77494",
      skills: ["cooking", "teaching"],
      availability: ["2024-06-01"]
    };
    
    const mockEvent = {
      _id: new ObjectId("67dce403deb657df9900d5a7"),
      name: "Test Event",
      date: "2024-06-01",
      zipCode: "77494",
      skills: ["cooking"],
      volunteers: []
    };
    
    // Setup the mock responses
    mockVolunteersCollection.findOne.mockResolvedValue(mockVolunteer);
    mockEventsCollection.findOne.mockResolvedValueOnce(mockEvent);
    
    // Make updateOne fail to simulate concurrency issue
    mockEventsCollection.updateOne.mockRejectedValueOnce(new Error("Concurrency issue"));
    
    // Act
    const response = await request(app)
      .post(`/api/volunteerAssignments/assignVolunteer/${volunteerId}`)
      .send();
    
    // Assert
    expect(response.status).toBe(500);
    expect(response.body.error).toContain("Error assigning volunteer");
  });

  test("Should handle case where event has null volunteers array", async () => {
    // Arrange
    const volunteerId = "67dcf07d20227aed7bc5ac48";
    const volunteerId_ObjectId = new ObjectId(volunteerId);
    
    const mockVolunteer = {
      _id: volunteerId_ObjectId,
      firstName: "John",
      lastName: "Doe",
      zipCode1: "77494",
      skills: ["cooking", "teaching"],
      availability: ["2024-06-01"]
    };
    
    const mockEvent = {
      _id: new ObjectId("67dce403deb657df9900d5a7"),
      name: "Test Event",
      date: "2024-06-01",
      zipCode: "77494",
      skills: ["cooking"],
      volunteers: null // Null instead of an array
    };
    
    const updatedEvent = {
      ...mockEvent,
      volunteers: [volunteerId]
    };
    
    // Setup the mock responses
    mockVolunteersCollection.findOne.mockResolvedValue(mockVolunteer);
    mockEventsCollection.findOne
      .mockResolvedValueOnce(mockEvent)
      .mockResolvedValueOnce(updatedEvent);
    
    // Act
    const response = await request(app)
      .post(`/api/volunteerAssignments/assignVolunteer/${volunteerId}`)
      .send();
    
    // Assert
    expect(response.status).toBe(200);
    expect(response.body.message).toContain("successfully");
  });
  
  test("Should handle empty skills array in volunteer", async () => {
    // Arrange
    const volunteerId = "67dcf07d20227aed7bc5ac48";
    const volunteerId_ObjectId = new ObjectId(volunteerId);
    
    const mockVolunteer = {
      _id: volunteerId_ObjectId,
      firstName: "John",
      lastName: "Doe",
      zipCode1: "77494",
      skills: [], // Empty skills array
      availability: ["2024-06-01"]
    };
    
    const fallbackEvent = {
      _id: new ObjectId("67dce403deb657df9900d5a7"),
      name: "Fallback Event",
      date: "2024-06-10",
      zipCode: "12345",
      skills: ["admin"],
      volunteers: []
    };
    
    const updatedEvent = {
      ...fallbackEvent,
      volunteers: [volunteerId]
    };
    
    // Setup the mock responses
    mockVolunteersCollection.findOne.mockResolvedValue(mockVolunteer);
    mockEventsCollection.findOne
      .mockResolvedValueOnce(null) // No matching event
      .mockResolvedValueOnce(fallbackEvent)
      .mockResolvedValueOnce(updatedEvent);
    
    // Act
    const response = await request(app)
      .post(`/api/volunteerAssignments/assignVolunteer/${volunteerId}`)
      .send();
    
    // Assert
    expect(response.status).toBe(200);
    expect(response.body.message).toContain("to fallback event");
  });
});