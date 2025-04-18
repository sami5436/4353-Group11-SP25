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
      // For testing, return an object with toString method
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
    updateOne: jest.fn(),
    updateMany: jest.fn(),
    insertMany: jest.fn(),
    insertOne: jest.fn(),
    countDocuments: jest.fn(),
    sort: jest.fn().mockReturnThis(),
    toArray: jest.fn(),
  };

  // Mock database with collections method
  const mockDb = {
    collection: jest.fn().mockReturnValue(mockCollection),
  };

  // Return a function that resolves to the mockDb
  return jest.fn().mockResolvedValue(mockDb);
});

// Mock notifications data
const mockNotifications = [
  {
    _id: "1",
    message: "Notification 1",
    recipientId: "user123",
    recipientType: "admin",
    read: false,
    notificationType: "volunteer_signup",
    timestamp: new Date()
  },
  {
    _id: "2",
    message: "Notification 2",
    recipientId: "user123",
    recipientType: "admin",
    read: true,
    notificationType: "event_creation",
    timestamp: new Date()
  },
  {
    _id: "3",
    message: "Notification 3",
    recipientId: "user123",
    recipientType: "admin",
    read: false,
    notificationType: "volunteer_signup",
    timestamp: new Date()
  }
];

// Mock events data for testing reminders
const mockEvents = [
  {
    _id: new ObjectId("60d21b4967d0d8992e610c85"),
    name: "Test Event 1",
    date: new Date().toISOString().split('T')[0], // Today's date in yyyy-mm-dd format
    status: "Upcoming",
    volunteers: ["user123", "user456"],
    createdBy: "admin123",
    address: "123 Main St",
    city: "Houston",
    state: "TX"
  },
  {
    _id: new ObjectId("60d21b4967d0d8992e610c86"),
    name: "Test Event 2",
    date: (() => {
      const date = new Date();
      date.setDate(date.getDate() + 3); // 3 days from now
      return date.toISOString().split('T')[0];
    })(),
    status: "Upcoming",
    volunteers: ["user789"],
    createdBy: "admin456",
    address: "456 Oak Ave",
    city: "Austin",
    state: "TX"
  }
];

let mockDb;

// Setup the mocks before running tests
beforeAll(async () => {
  // Get the mock database from our mocked connectDB function
  mockDb = await connectDB();
  
  // Configure mock responses
  const mockCollection = mockDb.collection();
  
  // Setup find query results
  mockCollection.toArray.mockImplementation(() => {
    return Promise.resolve(mockNotifications);
  });
  
  // Setup findOne to return specific notification or null for testing 404
  mockCollection.findOne.mockImplementation((query) => {
    if (query && query._id && query._id.toString() === "1") {
      return Promise.resolve({
        _id: "1",
        message: "Notification 1",
        recipientId: "user123",
        read: true
      });
    } else if (query && query._id && query._id.toString() === "1000000000000000") {
      return Promise.resolve(null);
    }
    return Promise.resolve(mockNotifications[0]);
  });
  
  // Setup updateOne to return success
  mockCollection.updateOne.mockResolvedValue({ matchedCount: 1, modifiedCount: 1 });
  
  // Setup updateMany to return success
  mockCollection.updateMany.mockResolvedValue({ modifiedCount: 2 });

  // Setup insertMany to return success
  mockCollection.insertMany.mockResolvedValue({ insertedCount: 2, insertedIds: { 0: "new1", 1: "new2" } });
  
  // Setup insertOne to return success
  mockCollection.insertOne.mockResolvedValue({ insertedId: "new3" });

  // Setup countDocuments to return 0 by default (no existing reminders)
  mockCollection.countDocuments.mockResolvedValue(0);
  
  // Mock request cookies
  jest.spyOn(app.request, 'get').mockImplementation(function(name) {
    if (name === 'cookie') {
      return 'userId=user123';
    }
    return this.headers && this.headers[name.toLowerCase()];
  });

  // Add mocks for the specific collection implementations needed for event reminders
  mockDb.collection.mockImplementation((collectionName) => {
    if (collectionName === "events") {
      return {
        ...mockCollection,
        find: jest.fn().mockImplementation(() => {
          return {
            toArray: jest.fn().mockResolvedValue(mockEvents)
          };
        })
      };
    }
    return mockCollection;
  });
});

// Reset mock function calls between tests
afterEach(() => {
  jest.clearAllMocks();
});

describe("Notification API", () => {
  it("should return all notifications", async () => {
    const mockCollection = mockDb.collection();
    mockCollection.toArray.mockResolvedValue(mockNotifications);
    
    const res = await request(app)
      .get("/api/notifications")
      .set('Cookie', ['userId=user123']);
      
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("should return notifications filtered by type", async () => {
    const mockCollection = mockDb.collection();
    const filteredNotifications = mockNotifications.filter(
      notif => notif.notificationType === "volunteer_signup"
    );
    mockCollection.toArray.mockResolvedValue(filteredNotifications);
    
    const res = await request(app)
      .get("/api/notifications?type=volunteer_signup")
      .set('Cookie', ['userId=user123']);
      
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(
      res.body.every((notif) => notif.notificationType === "volunteer_signup")
    ).toBe(true);
  });

  it("should return only unread notifications when filtered", async () => {
    const mockCollection = mockDb.collection();
    const unreadNotifications = mockNotifications.filter(notif => !notif.read);
    mockCollection.toArray.mockResolvedValue(unreadNotifications);
    
    const res = await request(app)
      .get("/api/notifications?unread=true")
      .set('Cookie', ['userId=user123']);
      
    expect(res.statusCode).toBe(200);
    expect(res.body.every((notif) => notif.read === false)).toBe(true);
  });

  it("should mark a notification as read", async () => {
    const mockCollection = mockDb.collection();
    mockCollection.findOne.mockResolvedValueOnce({
      _id: "1",
      recipientId: "user123",
      message: "Test notification",
      read: false
    }).mockResolvedValueOnce({
      _id: "1",
      recipientId: "user123",
      message: "Test notification",
      read: true
    });
    
    const res = await request(app)
      .put("/api/notifications/1/read")
      .set('Cookie', ['userId=user123']);
      
    expect(res.statusCode).toBe(200);
    expect(res.body.read).toBe(true);
  });

  it("should not find a notification, then return a 404", async () => {
    const mockCollection = mockDb.collection();
    mockCollection.findOne.mockResolvedValue(null);
    
    const res = await request(app)
      .put("/api/notifications/1000000000000000/read")
      .set('Cookie', ['userId=user123']);
      
    expect(res.statusCode).toBe(404);
  });

  it("should mark all notifications as read", async () => {
    const mockCollection = mockDb.collection();
    mockCollection.updateMany.mockResolvedValue({ modifiedCount: 3 });
    
    const res = await request(app)
      .put("/api/notifications/markAllRead?recipientType=admin")
      .set('Cookie', ['userId=user123']);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should return 401 when no user is authenticated", async () => {
    // Temporarily remove the cookie mock
    app.request.get.mockRestore();
    
    const res = await request(app).get("/api/notifications");
    
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Unauthorized: No user ID found in cookies");
    
    // Reset the cookie mock for subsequent tests
    jest.spyOn(app.request, 'get').mockImplementation(function(name) {
      if (name === 'cookie') {
        return 'userId=user123';
      }
      return this.headers && this.headers[name.toLowerCase()];
    });
  });

  it("should handle errors when marking a notification as read", async () => {
    const mockCollection = mockDb.collection();
    mockCollection.findOne.mockResolvedValueOnce({
      _id: "1",
      recipientId: "user123",
      message: "Test notification"
    });
    mockCollection.updateOne.mockRejectedValue(new Error("Database error"));
    
    const res = await request(app)
      .put("/api/notifications/1/read")
      .set('Cookie', ['userId=user123']);
      
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Error marking notification as read");
  });

  it("should handle errors when marking all notifications as read", async () => {
    const mockCollection = mockDb.collection();
    mockCollection.updateMany.mockRejectedValue(new Error("Database error"));
    
    const res = await request(app)
      .put("/api/notifications/markAllRead")
      .set('Cookie', ['userId=user123']);
      
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Error marking all notifications as read");
  });

  // New tests for event reminders
  describe("Event Reminders", () => {
    it("should send event reminders for events in the specified days", async () => {
      const res = await request(app)
        .get("/api/notifications/send-reminders?reminderDays=3")
        .set('Cookie', ['userId=admin123']);
        
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('notificationsCreated');
    });

    it("should return 400 for invalid reminderDays parameter", async () => {
      const res = await request(app)
        .get("/api/notifications/send-reminders?reminderDays=-1")
        .set('Cookie', ['userId=admin123']);
        
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Invalid reminderDays parameter");
    });

    it("should handle errors when sending reminders", async () => {
      const mockCollection = mockDb.collection();
      
      // Force an error by making one of the methods throw
      mockDb.collection.mockImplementationOnce(() => {
        throw new Error("Database error");
      });
      
      const res = await request(app)
        .get("/api/notifications/send-reminders")
        .set('Cookie', ['userId=admin123']);
        
      expect(res.statusCode).toBe(500);
      expect(res.body.message).toBe("Error sending event reminders");
    });

    it("should process multiple reminder intervals", async () => {
      const res = await request(app)
        .get("/api/notifications/check-all-reminders")
        .set('Cookie', ['userId=admin123']);
        
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.remindersSent).toHaveProperty('1_days');
      expect(res.body.remindersSent).toHaveProperty('3_days');
      expect(res.body.remindersSent).toHaveProperty('7_days');
    });

    it("should not create duplicate reminders", async () => {
      // First make countDocuments return 1 to simulate existing reminders
      const mockCollection = mockDb.collection();
      mockCollection.countDocuments.mockResolvedValue(1);
      
      const res = await request(app)
        .get("/api/notifications/send-reminders?reminderDays=3")
        .set('Cookie', ['userId=admin123']);
        
      expect(res.statusCode).toBe(200);
      expect(res.body.notificationsCreated).toBe(0); // No new notifications should be created
    });
  });
});