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

describe("getEventsByID", () => {
  const testingID = "67dcfcf2b7002f35f9a9a446";

  test("If no events found for this volunteer, should return 404", async () => {
    const nonExistentId = new ObjectId();
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
    const nonExistentId = new ObjectId();
    const response = await request(app).get(
      `/api/volunteers/volunteer/${nonExistentId}`
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
