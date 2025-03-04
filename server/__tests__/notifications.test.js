const request = require("supertest");
const app = require("../server");

describe("Notification API", () => {
  it("should return all notifications", async () => {
    const res = await request(app).get("/api/notifications");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("should return notifications filtered by type", async () => {
    const res = await request(app).get("/api/notifications?type=volunteer_signup");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.every(notif => notif.type === "volunteer_signup")).toBe(true);
  });

  it("should return only unread notifications when filtered", async () => {
    const res = await request(app).get("/api/notifications?unread=true");
    expect(res.statusCode).toBe(200);
    expect(res.body.every(notif => notif.read === false)).toBe(true);
  });

  it("should mark a notification as read", async () => {
    const res = await request(app).put("/api/notifications/1/read");
    expect(res.statusCode).toBe(200);
    expect(res.body.read).toBe(true);
  });

  it("should mark all notifications as read", async () => {
    const res = await request(app).put("/api/notifications/markAllRead");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});