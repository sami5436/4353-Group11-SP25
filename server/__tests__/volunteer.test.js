const request = require("supertest");
const app = require("../server");
const connectDB = require("../db");
const { ObjectId } = require("mongodb");

jest.mock("../db", () => {
  const mockCollection = {
    find: jest.fn().mockReturnThis(),
    toArray: jest.fn().mockImplementation(function() {
      const query = this._query || {};
      
      const testId = "67dcfcf2b7002f35f9a9a446";
      
      if (query.volunteers) {
        if (query.volunteers === testId) {
          if (query.status === "Upcoming") {
            return Promise.resolve([{
              _id: "event1",
              name: "For volunteer.test.js",
              date: "2024-06-01",
              status: "Upcoming",
              volunteers: [testId]
            }]);
          }
          return Promise.resolve([{
            _id: "event1",
            name: "For volunteer.test.js",
            date: "2024-06-01",
            status: "Upcoming",
            volunteers: [testId]
          }]);
        }
        return Promise.resolve([]);
      }
      return Promise.resolve([]);
    }),
  };

  mockCollection.find.mockImplementation(function(query) {
    this._query = query;
    return this;
  });
  
  const mockDb = {
    collection: jest.fn().mockReturnValue(mockCollection),
  };
  
  return jest.fn().mockResolvedValue(mockDb);
});

jest.mock("mongodb", () => {
  const originalModule = jest.requireActual("mongodb");
  return {
    ...originalModule,
    ObjectId: jest.fn().mockImplementation((id) => {
      return {
        toString: () => id || "mocked-object-id"
      };
    }),
  };
});

describe("getEventsByID", () => {
  const testingID = "67dcfcf2b7002f35f9a9a446";

  test("If no events found for this volunteer, should return 404", async () => {
    const nonExistentId = "nonexistentid123456789012";
    const response = await request(app).get(
      `/api/volunteers/volunteer/${nonExistentId}`
    );

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("No events found for this volunteer");
  });

  test("should return assigned events", async () => {
    const response = await request(app).get(
      `/api/volunteers/volunteer/${testingID}`
    );

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
    expect(response.body[0].name).toBe("For volunteer.test.js");
  });
});

describe("getUpcomingEventsByID", () => {
  const testingID = "67dcfcf2b7002f35f9a9a446";

  test("If no events found for this volunteer, should return 404", async () => {
    const nonExistentId = "nonexistentid123456789012";
    const response = await request(app).get(
      `/api/volunteers/volunteer/${nonExistentId}/upcoming`
    );

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("No events found for this volunteer");
  });

  test("should return assigned events which contain upcoming field", async () => {
    const response = await request(app).get(
      `/api/volunteers/volunteer/${testingID}/upcoming`
    );

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
    expect(response.body[0].name).toBe("For volunteer.test.js");
    expect(response.body[0].status).toBe("Upcoming");
  });
});