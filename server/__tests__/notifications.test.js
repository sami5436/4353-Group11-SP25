const request = require("supertest");
const app = require("../server");
const bcrypt = require("bcrypt");
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

describe("Notification API", () => {
  it("should return all notifications", async () => {
    const res = await request(app).get("/api/notifications");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("should return notifications filtered by type", async () => {
    const res = await request(app).get(
      "/api/notifications?type=volunteer_signup"
    );
    expect(res.statusCode).toBe(200);
    console.log("Response body:", res.body);
    expect(res.body.length).toBeGreaterThan(0);
    expect(
      res.body.every((notif) => notif.notificationType === "volunteer_signup")
    ).toBe(true);
  });

  it("should return only unread notifications when filtered", async () => {
    const res = await request(app).get("/api/notifications?unread=true");
    expect(res.statusCode).toBe(200);
    expect(res.body.every((notif) => notif.read === false)).toBe(true);
  });

  it("should mark a notification as read", async () => {
    const res = await request(app).put("/api/notifications/1/read");
    expect(res.statusCode).toBe(200);
    expect(res.body.read).toBe(true);
  });

  it("should not find a notification, then return a 404", async () => {
    const res = await request(app).put(
      "/api/notifications/1000000000000000/read"
    );
    expect(res.statusCode).toBe(404);
    // expect(res.body.read).toBe(true);
  });

  it("should mark all notifications as read", async () => {
    // Add the required query parameters
    const res = await request(app).put(
      "/api/notifications/markAllRead?recipientType=admin"
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("should not find a notification, then return a 404", async () => {
    const res = await request(app).put(
      "/api/notifications/1000000000000000/read"
    );
    expect(res.statusCode).toBe(404);
    // expect(res.body.read).toBe(true);
  });

  // it("should handle server errors when retrieving notifications", async () => {
  //   // Mock the MongoDB collection method to throw an error
  //   const { MongoClient } = require("mongodb");

  //   // Save the original implementation
  //   const originalDb = require("../db");
  //   const originalConnect = MongoClient.prototype.connect;

  //   // Override the connectDB function to throw an error
  //   jest.mock("../db", () => {
  //     return jest.fn().mockImplementation(() => {
  //       throw new Error("Database connection error");
  //     });
  //   });

  //   // Make the request - this should now trigger the error handler
  //   const res = await request(app).get("/api/notifications");

  //   // Verify error response
  //   expect(res.statusCode).toBe(500);
  //   expect(res.body).toHaveProperty(
  //     "message",
  //     "Error retrieving notifications"
  //   );
  //   expect(res.body).toHaveProperty("error");

  //   // Restore the original implementation
  //   jest.resetModules();
  // });
});
