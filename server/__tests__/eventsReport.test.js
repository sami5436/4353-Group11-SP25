const request = require("supertest");
const app = require("../server");
const connectDB = require("../db");
const { ObjectId } = require("mongodb");

jest.mock("mongodb", () => {
  const originalModule = jest.requireActual("mongodb");
  
  return {
    ...originalModule,
    ObjectId: jest.fn().mockImplementation((id) => {
      return {
        toString: () => id || "mockObjectId123456789012"
      };
    }),
  };
});

jest.mock("../db", () => {

  const mockCollection = {
    find: jest.fn().mockReturnThis(),
    aggregate: jest.fn().mockReturnThis(),
    countDocuments: jest.fn(),
    toArray: jest.fn(),
  };

  const mockDb = {
    collection: jest.fn().mockReturnValue(mockCollection),
  };

  return jest.fn().mockResolvedValue(mockDb);
});

const mockCookies = () => {

  const originalGet = app.request.get;
  app.request.get = function(field) {
    if (field === 'cookie') {
      return 'userId=admin123'; 
    }
    return originalGet.apply(this, arguments);
  };
};

let mockDb;
beforeAll(async () => {
  mockDb = await connectDB();
  
  mockCookies();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("Events Report API - Summary Endpoint", () => {
  it("should return summary statistics", async () => {

    const mockCollection = mockDb.collection();
    
    mockCollection.countDocuments.mockImplementation((query) => {
      if (query.role === "volunteer") {
        return Promise.resolve(256);
      } else if (query.status === "Upcoming") {
        return Promise.resolve(12);
      } else if (query.status === "Completed") {
        return Promise.resolve(24);
      }
      return Promise.resolve(0);
    });
    
    mockCollection.find.mockReturnThis();
    mockCollection.toArray.mockResolvedValue([
      { volunteers: ["vol1", "vol2", "vol3"] },
      { volunteers: ["vol4", "vol5"] },
      { volunteers: [] },
      { volunteers: ["vol6"] }
    ]);

    const res = await request(app)
      .get("/api/reports/summary")
      .set('Cookie', ['userId=admin123']); 
      
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("totalVolunteers");
    expect(res.body).toHaveProperty("volunteerHours");
    expect(res.body).toHaveProperty("upcomingEvents");
    expect(res.body).toHaveProperty("completedEvents");
    expect(res.body.totalVolunteers).toBe(256);
    expect(res.body.volunteerHours).toBe(30); 
  });

  it("should handle errors when fetching summary", async () => {

    const mockCollection = mockDb.collection();
    mockCollection.countDocuments.mockRejectedValue(new Error("Database error"));

    const res = await request(app)
      .get("/api/reports/summary")
      .set('Cookie', ['userId=admin123']); 
      
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Error retrieving report summary");
  });
});

describe("Events Report API - Engagement Endpoint", () => {
  it("should return volunteer engagement data", async () => {

    const mockCollection = mockDb.collection();
    
    const currentYear = new Date().getFullYear();
    mockCollection.find.mockReturnThis();
    mockCollection.toArray.mockResolvedValue([
      { 
        date: `${currentYear}-01-15`, 
        volunteers: ["vol1", "vol2"] 
      },
      { 
        date: `${currentYear}-01-20`, 
        volunteers: ["vol3"] 
      },
      { 
        date: `${currentYear}-03-10`, 
        volunteers: ["vol4", "vol5", "vol6"] 
      }
    ]);

    const res = await request(app)
      .get("/api/reports/engagement")
      .set('Cookie', ['userId=admin123']); 
      
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(12); 
    
    expect(res.body[0].month).toBe("Jan");
    expect(res.body[0].volunteers).toBe(3); 
    expect(res.body[0].events).toBe(2); 
    
    expect(res.body[2].month).toBe("Mar");
    expect(res.body[2].volunteers).toBe(3); 
    expect(res.body[2].events).toBe(1); 
  });

  it("should handle errors when fetching engagement data", async () => {

    const mockCollection = mockDb.collection();
    mockCollection.find.mockReturnThis();
    mockCollection.toArray.mockRejectedValue(new Error("Database error"));

    const res = await request(app)
      .get("/api/reports/engagement")
      .set('Cookie', ['userId=admin123']); 
      
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Error retrieving volunteer engagement");
  });
});

describe("Events Report API - Distribution Endpoint", () => {
  it("should return event distribution data", async () => {

    const mockCollection = mockDb.collection();
    mockCollection.aggregate.mockReturnThis();
    mockCollection.toArray.mockResolvedValue([
      { _id: "Upcoming", count: 12 },
      { _id: "Completed", count: 24 },
      { _id: "Cancelled", count: 3 }
    ]);

    const res = await request(app)
      .get("/api/reports/distribution")
      .set('Cookie', ['userId=admin123']); 
      
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(3); 
    
    expect(res.body[0]).toHaveProperty("status");
    expect(res.body[0]).toHaveProperty("count");
    
    const upcomingData = res.body.find(item => item.status === "Upcoming");
    expect(upcomingData.count).toBe(12);
    
    const completedData = res.body.find(item => item.status === "Completed");
    expect(completedData.count).toBe(24);
  });

  it("should handle errors when fetching distribution data", async () => {

    const mockCollection = mockDb.collection();
    mockCollection.aggregate.mockReturnThis();
    mockCollection.toArray.mockRejectedValue(new Error("Database error"));

    const res = await request(app)
      .get("/api/reports/distribution")
      .set('Cookie', ['userId=admin123']); 
      
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Error retrieving event distribution");
  });
});

describe("Events Report API - Skills Distribution Endpoint", () => {
  it("should return skills distribution data", async () => {

    const mockCollection = mockDb.collection();
    mockCollection.find.mockReturnThis();
    mockCollection.toArray.mockResolvedValue([
      { skills: ["First Aid & CPR", "Event Coordination", "Technical Support"] },
      { skills: ["First Aid & CPR", "Teaching"] },
      { skills: ["Technical Support", "Event Coordination", "Manual Labor"] },
      { skills: ["First Aid & CPR", "Food Services"] }
    ]);

    const res = await request(app)
      .get("/api/reports/skills")
      .set('Cookie', ['userId=admin123']); 
      
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    
    expect(res.body[0]).toHaveProperty("skill");
    expect(res.body[0]).toHaveProperty("count");
    
    expect(res.body[0].skill).toBe("First Aid & CPR");
    expect(res.body[0].count).toBe(3);
    
    expect(res.body[1].skill).toBe("Event Coordination");
    expect(res.body[1].count).toBe(2);
  });

  it("should handle errors when fetching skills data", async () => {

    const mockCollection = mockDb.collection();
    mockCollection.find.mockReturnThis();
    mockCollection.toArray.mockRejectedValue(new Error("Database error"));

    const res = await request(app)
      .get("/api/reports/skills")
      .set('Cookie', ['userId=admin123']); 
      
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Error retrieving skills distribution");
  });
});

describe("Events Report API - Top Locations Endpoint", () => {
  it("should return top locations data", async () => {

    const mockCollection = mockDb.collection();
    mockCollection.aggregate.mockReturnThis();
    mockCollection.toArray.mockResolvedValue([
      { _id: "New York", count: 8 },
      { _id: "Los Angeles", count: 6 },
      { _id: "Chicago", count: 4 },
      { _id: "Houston", count: 3 },
      { _id: "Phoenix", count: 2 }
    ]);

    const res = await request(app)
      .get("/api/reports/locations")
      .set('Cookie', ['userId=admin123']); 
      
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(5); 
    
    expect(res.body[0]).toHaveProperty("city");
    expect(res.body[0]).toHaveProperty("count");
    
    expect(res.body[0].city).toBe("New York");
    expect(res.body[0].count).toBe(8);
    
    expect(res.body[1].city).toBe("Los Angeles");
    expect(res.body[1].count).toBe(6);
  });

  it("should handle errors when fetching locations data", async () => {
    const mockCollection = mockDb.collection();
    mockCollection.aggregate.mockReturnThis();
    mockCollection.toArray.mockRejectedValue(new Error("Database error"));

    const res = await request(app)
      .get("/api/reports/locations")
      .set('Cookie', ['userId=admin123']); 
      
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Error retrieving top locations");
  });
});