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

describe("Auth API - Login", () => {
  it("should login successfully with valid credentials", async () => {
    const loginData = {
      email: "DoNotTouch2@gmail.com",
      password: "TestPassword1",
    };

    const res = await request(app).post("/api/auth/login").send(loginData);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Login successful");
    expect(res.body).toHaveProperty("userId");
    expect(res.body).toHaveProperty("userType", "volunteer");
    expect(res.body).toHaveProperty("redirectPath", "/volunteer/profile");
  });

  it("should return 400 when email is missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ password: "SomePassword123" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Email and password are required");
  });

  it("should return 400 when password is missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "DoNotTouch2@gmail.com" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Email and password are required");
  });

  it("should return 401 with invalid credentials - wrong password", async () => {
    const loginData = {
      email: "test-user@example.com",
      password: "WrongPassword123",
    };

    const res = await request(app).post("/api/auth/login").send(loginData);

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error", "Invalid credentials");
  });

  it("should return 401 with invalid credentials - non-existent user", async () => {
    const loginData = {
      email: "nonexistent@example.com",
      password: "Password123",
    };

    const res = await request(app).post("/api/auth/login").send(loginData);

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error", "Invalid credentials");
  });

  it("should redirect admin users to admin profile", async () => {
    // First create an admin user

    const loginData = {
      email: "DoNotTouchAdmin@gmail.com",
      password: "AdminPass123",
    };

    const res = await request(app).post("/api/auth/login").send(loginData);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("redirectPath", "/admin/profile");
    expect(res.body).toHaveProperty("userType", "admin");

    // // Clean up
    // await db.collection("users").deleteOne({ email: "admin@example.com" });
  });

  it("should test additional error cases for login", async () => {
    // Test completely empty request
    const emptyRes = await request(app).post("/api/auth/login").send({});
    expect(emptyRes.statusCode).toBe(400);
    expect(emptyRes.body).toHaveProperty(
      "error",
      "Email and password are required"
    );
  });
});

describe("Auth API - Signup", () => {
  it("should signup successfully with valid data for volunteer", async () => {
    const userData = {
      email: `test+${Date.now()}@example.com`,
      password: "StrongPassword123",
      confirmPassword: "StrongPassword123",
      role: "volunteer",
    };

    const res = await request(app).post("/api/auth/signup").send(userData);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message", "User registered successfully");
    expect(res.body).toHaveProperty("userId");
    expect(res.body).toHaveProperty("role", "volunteer");

    // // Clean up
    // if (res.body.userId) {
    //   await db
    //     .collection("users")
    //     .deleteOne({ _id: new ObjectId(res.body.userId) });
    // }
  });

  it("should signup successfully with valid data for admin", async () => {
    const userData = {
      email: `admin+${Date.now()}@example.com`,
      password: "StrongPassword123",
      confirmPassword: "StrongPassword123",
      role: "admin",
    };

    const res = await request(app).post("/api/auth/signup").send(userData);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message", "User registered successfully");
    expect(res.body).toHaveProperty("userId");
    expect(res.body).toHaveProperty("role", "admin");

    // // Clean up
    // if (res.body.userId) {
    //   await db
    //     .collection("users")
    //     .deleteOne({ _id: new ObjectId(res.body.userId) });
    // }
  });

  it("should return an error if passwords do not match", async () => {
    const userData = {
      email: "invaliduser@example.com",
      password: "Password123",
      confirmPassword: "WrongPassword123",
      role: "user",
    };

    const res = await request(app).post("/api/auth/signup").send(userData);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Passwords do not match");
  });

  it("should not let a duplicate email sign up", async () => {
    // First create a user
    const userData = {
      email: "duplicate@example.com",
      password: "StrongPassword123",
      confirmPassword: "StrongPassword123",
      role: "volunteer",
    };

    const firstRes = await request(app).post("/api/auth/signup").send(userData);

    // Try to sign up with the same email
    const res = await request(app).post("/api/auth/signup").send(userData);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Email already in use");

    // // Clean up
    // await app.db
    //   .collection("users")
    //   .deleteOne({ email: "duplicate@example.com" });
  });

  it("should return an error if there is no confirmation of passwords", async () => {
    const userData = {
      email: "invaliduser@example.com",
      password: "Password123",
      confirmPassword: "",
      role: "user",
    };

    const res = await request(app).post("/api/auth/signup").send(userData);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "All fields are required");
  });

  it("should return an error for invalid email format", async () => {
    const userData = {
      email: "invalid-email",
      password: "StrongPassword123",
      confirmPassword: "StrongPassword123",
      role: "user",
    };

    const res = await request(app).post("/api/auth/signup").send(userData);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Invalid email format");
  });

  it("should return an error if password doesn't meet requirements", async () => {
    const userData = {
      email: "validuser@example.com",
      password: "weak",
      confirmPassword: "weak",
      role: "user",
    };

    const res = await request(app).post("/api/auth/signup").send(userData);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty(
      "error",
      "Password must be at least 8 characters long and contain uppercase, lowercase, and number"
    );
  });

  it("should return an error if missing required fields", async () => {
    const userData = {
      email: "validuser@example.com",
      role: "user",
    };

    const res = await request(app).post("/api/auth/signup").send(userData);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "All fields are required");
  });
});
