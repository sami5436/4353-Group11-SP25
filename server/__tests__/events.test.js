const request = require("supertest");
const app = require("../server");
const connectDB = require("../db");
const { ObjectId } = require("mongodb");

// Mock MongoDB ObjectId
jest.mock("mongodb", () => {
  const originalModule = jest.requireActual("mongodb");
  
  return {
    ...originalModule,
    ObjectId: jest.fn().mockImplementation((id) => {
      if (id === "999999999999999999999999") {
        return { toString: () => "999999999999999999999999" };
      }
      // Make sure we return an object with toString method to mimic real ObjectId behavior
      return {
        toString: () => id || "mockObjectId123456789012"
      };
    }),
  };
});

// Mock database connection for testing
jest.mock("../db", () => {
  // Mock collection methods
  const mockCollection = {
    find: jest.fn().mockReturnThis(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    insertOne: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
    toArray: jest.fn(),
  };

  // Mock database with collections method
  const mockDb = {
    collection: jest.fn().mockReturnValue(mockCollection),
  };

  // Return a function that resolves to the mockDb
  return jest.fn().mockResolvedValue(mockDb);
});

// Setup mock data
let mockDb;
let mockEvents = [
  {
    _id: "event1",
    name: "Test Event 1",
    date: "2024-06-01",
    city: "Test City",
    state: "TX",
    zipCode: "12345",
    address: "123 Test St",
    status: "Upcoming",
    description: "Test Description",
    volunteers: [],
    skills: ["Testing"]
  },
  {
    _id: "event2",
    name: "Test Event 2",
    date: "2024-07-01",
    city: "Another City",
    state: "CA",
    zipCode: "54321",
    address: "456 Test Ave",
    status: "Completed",
    description: "Another Test Description",
    volunteers: ["vol1", "vol2"],
    skills: ["Coordination", "Planning"]
  }
];

// Mock volunteer data
const mockVolunteers = [
  {
    _id: { toString: () => "vol1" },
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com"
  },
  {
    _id: { toString: () => "vol2" },
    firstName: "Jane",
    lastName: "Smith",
    email: "jane@example.com"
  }
];

// Mock auth with cookies
const mockCookies = () => {
  // Mock the cookies middleware to simulate authenticated requests
  const originalGet = app.request.get;
  app.request.get = function(field) {
    if (field === 'cookie') {
      return 'userId=admin123'; // Simulate auth cookie
    }
    return originalGet.apply(this, arguments);
  };
};

// Setup the mocks before running tests
beforeAll(async () => {
  // Get the mock database from our mocked connectDB function
  mockDb = await connectDB();
  
  // Configure mock responses
  const mockCollection = mockDb.collection();
  mockCollection.toArray.mockResolvedValue(mockEvents);
  mockCollection.insertOne.mockResolvedValue({ insertedId: "newEventId" });
  
  // Setup findOne to return different results based on query
  mockCollection.findOne.mockImplementation((query) => {
    if (query._id === "event1" || query._id.toString() === "123456789012345678901234") {
      return Promise.resolve(mockEvents[0]);
    } else if (query._id === "event2") {
      return Promise.resolve(mockEvents[1]);
    } else if (query._id && query._id.toString() === "999999999999999999999999") {
      return Promise.resolve(null);
    } else if (query.status === "Upcoming") {
      return Promise.resolve(mockEvents.filter(e => e.status === "Upcoming"));
    }
    return Promise.resolve(null);
  });
  
  // Setup findOneAndUpdate
  mockCollection.findOneAndUpdate.mockImplementation((query, update, options) => {
    // For successful update
    if (query._id && query._id.toString() !== "999999999999999999999999") {
      return Promise.resolve({ 
        _id: query._id,
        name: update.$set.name || "Updated Event Name",
        status: update.$set.status || "Completed"
      });
    } 
    // For 404 error case
    return Promise.resolve(null);
  });
  
  // Setup updateOne
  mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });
  
  // Setup deleteOne
  mockCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });
  
  // Setup auth cookies for tests
  mockCookies();
});

// Reset mock function calls between tests
afterEach(() => {
  jest.clearAllMocks();
});

describe("Event fetcher API for volunteer history", () => {
  it("should return all events", async () => {
    // Configure mock for this specific test
    const mockCollection = mockDb.collection();
    mockCollection.toArray.mockResolvedValue(mockEvents);

    const res = await request(app)
      .get("/api/events/history")
      .set('Cookie', ['userId=admin123']); // Add auth cookie
      
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("should return all events with root path", async () => {
    const mockCollection = mockDb.collection();
    mockCollection.toArray.mockResolvedValue(mockEvents);

    const res = await request(app)
      .get("/api/events")
      .set('Cookie', ['userId=admin123']); // Add auth cookie
      
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(mockEvents.length);
  });

  it("should handle error when fetching events", async () => {
    const mockCollection = mockDb.collection();
    mockCollection.toArray.mockRejectedValue(new Error("Database error"));

    const res = await request(app)
      .get("/api/events/history")
      .set('Cookie', ['userId=admin123']); // Add auth cookie
      
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Error retrieving events");
  });

  it("should add a new event", async () => {
    const newEvent = {
      name: "New Test Event",
      date: "2024-06-01",
      city: "Test City",
      state: "TX",
      zipCode: "12345",
      address: "123 Test St",
      status: "Upcoming",
      description: "Test Description",
      skills: ["Testing"]
    };

    // Configure mock for this specific test
    const mockCollection = mockDb.collection();
    mockCollection.insertOne.mockResolvedValue({ 
      insertedId: "123456789012345678901234" // Valid ObjectId format
    });

    const res = await request(app)
      .post("/api/events")
      .set('Cookie', ['userId=admin123']) // Add auth cookie
      .send(newEvent);
      
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe(newEvent.name);
    expect(res.body.skills).toEqual(expect.arrayContaining(newEvent.skills));
  });

  it("should handle error when adding an event", async () => {
    const newEvent = {
      name: "Error Event",
      date: "2024-06-01",
      city: "Error City",
      state: "TX",
      zipCode: "12345",
      address: "Error Street",
      status: "Upcoming",
      description: "This should trigger an error",
    };

    const mockCollection = mockDb.collection();
    mockCollection.insertOne.mockRejectedValue(new Error("Database insertion error"));

    const res = await request(app)
      .post("/api/events")
      .set('Cookie', ['userId=admin123']) // Add auth cookie
      .send(newEvent);
      
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Error adding event");
  });

  it("should not add an event with missing fields", async () => {
    const invalidEvent = {
      name: "Incomplete Event",
      city: "Test City",
      skills: [],
    };

    const res = await request(app)
      .post("/api/events")
      .set('Cookie', ['userId=admin123']) // Add auth cookie
      .send(invalidEvent);
      
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("All fields are required");
  });
  
  it("should not add an event without auth", async () => {
    const newEvent = {
      name: "New Test Event",
      date: "2024-06-01",
      city: "Test City",
      state: "TX",
      zipCode: "12345",
      address: "123 Test St",
      status: "Upcoming",
      description: "Test Description",
      skills: ["Testing"]
    };

    // No auth cookie set
    const res = await request(app)
      .post("/api/events")
      .send(newEvent);
      
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Unauthorized: Admin ID not found");
  });

  it("should fetch upcoming events", async () => {
    const mockCollection = mockDb.collection();
    mockCollection.find.mockReturnThis();
    mockCollection.toArray.mockResolvedValue([mockEvents[0]]);

    const res = await request(app)
      .get("/api/events/upcoming")
      .set('Cookie', ['userId=admin123']); // Add auth cookie
      
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should handle error when fetching upcoming events", async () => {
    const mockCollection = mockDb.collection();
    mockCollection.find.mockReturnThis();
    mockCollection.toArray.mockRejectedValue(new Error("Database error"));

    const res = await request(app)
      .get("/api/events/upcoming")
      .set('Cookie', ['userId=admin123']); // Add auth cookie
      
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Error retrieving upcoming events");
  });

  it("should fetch all volunteers", async () => {
    // Configure mock for this specific test
    const mockCollection = mockDb.collection();
    mockCollection.toArray.mockResolvedValue([
      { name: "Event 1", volunteers: [{ id: "v1", name: "Volunteer 1" }] },
      { name: "Event 2", volunteers: [{ id: "v2", name: "Volunteer 2" }] }
    ]);

    const res = await request(app)
      .get("/api/events/volunteers")
      .set('Cookie', ['userId=admin123']); // Add auth cookie
      
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should handle error when fetching volunteers", async () => {
    const mockCollection = mockDb.collection();
    mockCollection.toArray.mockRejectedValue(new Error("Database error"));

    const res = await request(app)
      .get("/api/events/volunteers")
      .set('Cookie', ['userId=admin123']); // Add auth cookie
      
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Error retrieving volunteers");
  });

  it("should fetch all volunteers with detailed information", async () => {
    const mockCollection = mockDb.collection();
    // First call to toArray for events
    mockCollection.toArray.mockResolvedValueOnce(mockEvents);
    mockCollection.find.mockReturnThis();
    // Second call to toArray for volunteers
    mockCollection.toArray.mockResolvedValueOnce(mockVolunteers);

    const res = await request(app)
      .get("/api/events/allVolunteers")
      .set('Cookie', ['userId=admin123']); // Add auth cookie
      
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should handle error when fetching all volunteers", async () => {
    const mockCollection = mockDb.collection();
    mockCollection.toArray.mockRejectedValue(new Error("Database error"));

    const res = await request(app)
      .get("/api/events/allVolunteers")
      .set('Cookie', ['userId=admin123']); // Add auth cookie
      
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Error retrieving all volunteers");
  });

  it("should add a volunteer to an event", async () => {
    // Create an event first
    const newEvent = {
      name: "Volunteer Test Event",
      date: "2024-06-10",
      city: "New City",
      state: "TX", 
      zipCode: "12345",
      address: "123 New St",
      status: "Upcoming",
      description: "Event to test adding volunteers",
      volunteered: false,
      volunteers: [],
      skills: ["Technical Support", "Event Coordination"],
    };

    // Configure mock for event creation
    const mockCollection = mockDb.collection();
    const validObjectId = "123456789012345678901234"; // Valid ObjectId format (24 chars)
    mockCollection.insertOne.mockResolvedValue({ insertedId: validObjectId });
    
    // Mock the findOne call to return an event
    mockCollection.findOne.mockResolvedValue({ 
      _id: validObjectId, 
      name: "Volunteer Test Event" 
    });

    const eventRes = await request(app)
      .post("/api/events")
      .set('Cookie', ['userId=admin123']) // Add auth cookie
      .send(newEvent);
      
    expect(eventRes.statusCode).toBe(201);
    const eventId = eventRes.body.id || validObjectId;

    // Add a volunteer to the created event
    const newVolunteer = {
      eventId: validObjectId, // Use valid ObjectId format
      volunteerName: "John Doe", 
      volunteerEmail: "johndoe@example.com",
    };

    // Configure mock for volunteer addition
    mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

    const volunteerRes = await request(app)
      .post("/api/events/addVolunteer")
      .set('Cookie', ['userId=admin123']) // Add auth cookie
      .send(newVolunteer);
    
    expect(volunteerRes.statusCode).toBe(201);
    expect(volunteerRes.body).toHaveProperty("volunteerId");
  });

  it("should transfer a volunteer between events", async () => {
    const mockCollection = mockDb.collection();
    mockCollection.findOne.mockResolvedValue({ _id: "event1", name: "Test Event" });
    
    const transferData = {
      eventId: "event1",
      volunteerId: "volunteer1",
      sourceEventId: "event2"
    };
    
    const res = await request(app)
      .post("/api/events/addVolunteer")
      .set('Cookie', ['userId=admin123']) // Add auth cookie
      .send(transferData);
      
    expect(res.statusCode).toBe(201);
    expect(mockCollection.updateOne).toHaveBeenCalledTimes(2); // Two calls for remove and add
  });

  it("should reject volunteer addition with missing required fields", async () => {
    const invalidData = {
      // Missing eventId
      volunteerName: "Jane Doe", 
    };
    
    const res = await request(app)
      .post("/api/events/addVolunteer")
      .set('Cookie', ['userId=admin123']) // Add auth cookie
      .send(invalidData);
      
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Required fields are missing");
  });

  it("should handle error when adding a volunteer", async () => {
    const mockCollection = mockDb.collection();
    mockCollection.findOne.mockResolvedValue({ _id: "event1", name: "Test Event" });
    mockCollection.updateOne.mockRejectedValue(new Error("Database error"));
    
    const volunteerData = {
      eventId: "event1",
      volunteerName: "Error Volunteer", 
      volunteerEmail: "error@example.com",
    };
    
    const res = await request(app)
      .post("/api/events/addVolunteer")
      .set('Cookie', ['userId=admin123']) // Add auth cookie
      .send(volunteerData);
      
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Error managing volunteer");
  });
  
  it("should return 404 when event not found for volunteer addition", async () => {
    const mockCollection = mockDb.collection();
    mockCollection.findOne.mockResolvedValue(null); // Event not found
    
    const volunteerData = {
      eventId: "nonexistentEvent",
      volunteerName: "Test Volunteer", 
      volunteerEmail: "test@example.com",
    };
    
    const res = await request(app)
      .post("/api/events/addVolunteer")
      .set('Cookie', ['userId=admin123']) // Add auth cookie
      .send(volunteerData);
      
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Event not found");
  });
});

describe("Volunteer History API - Additional Test Cases", () => {
  let eventId = "123456789012345678901234"; // Use valid ObjectId format

  beforeEach(() => {
    // Reset and reconfigure the mock for each test
    const mockCollection = mockDb.collection();
    
    // Configure findOne to return an event when needed
    mockCollection.findOne.mockImplementation((query) => {
      if (query._id && query._id.toString() !== "999999999999999999999999") {
        return Promise.resolve({ 
          _id: query._id,
          name: "Test Event",
          status: "Upcoming"
        });
      }
      return Promise.resolve(null);
    });
    
    // Configure findOneAndUpdate for update tests
    mockCollection.findOneAndUpdate.mockImplementation((query, update, options) => {
      if (query._id && query._id.toString() !== "999999999999999999999999") {
        return Promise.resolve({ 
          _id: query._id,
          name: update.$set.name || "Updated Event Name",
          status: update.$set.status || "Completed"
        });
      }
      return Promise.resolve(null);
    });
  });

  
  
  it("should return 400 for invalid ObjectId format", async () => {
    const invalidId = "not-an-object-id";
    const updateData = {
      name: "Updated Name" 
    };
    
    const res = await request(app)
      .put(`/api/events/${invalidId}`)
      .set('Cookie', ['userId=admin123']) // Add auth cookie
      .send(updateData);
    
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Invalid event ID format");
  });


});