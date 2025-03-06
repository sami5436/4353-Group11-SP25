const request = require("supertest");
const app = require("../server");

describe("Auth API", () => {
  it("should login successfully with valid credentials", async () => {
    // You need to use a valid email/password combination that exists in your system
    const loginData = {
      email: "yuusf@gmail.com",
      password: "Mynameisyusuf1"
    };

    const res = await request(app)
      .post("/api/auth/login")
      .send(loginData);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Login successful");
    expect(res.body).toHaveProperty("userId");
    expect(res.body).toHaveProperty("role");
    expect(res.body).toHaveProperty("redirectPath");
  });

  it("should return 400 when email is missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ password: "SomePassword123" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Email and password are required");
  });
});

describe("Auth API - Signup", () => {
    it("should signup successfully with valid data", async () => {
      const userData = {
        email: `test+${Date.now()}@example.com`, //this is needed since we do not allow duplicate emails for users/admins
        password: "StrongPassword123",
        confirmPassword: "StrongPassword123",
        role: "user" 
      };
  
      const res = await request(app)
        .post("/api/auth/signup")
        .send(userData);
  
      expect(res.statusCode).toBe(201); 
      expect(res.body).toHaveProperty("message", "User registered successfully");
      expect(res.body).toHaveProperty("userId");
    });
  
    it("should return an error if passwords do not match", async () => {
      const userData = {
        email: "invaliduser@example.com",
        password: "Password123",
        confirmPassword: "WrongPassword123",
        role: "user"
      };
  
      const res = await request(app)
        .post("/api/auth/signup")
        .send(userData);
  
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error", "Passwords do not match");
    });
  
    it("should return an error for invalid email format", async () => {
      const userData = {
        email: "invalid-email",
        password: "StrongPassword123",
        confirmPassword: "StrongPassword123",
        role: "user"
      };
  
      const res = await request(app)
        .post("/api/auth/signup")
        .send(userData);
  
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error", "Invalid email format");
    });
  });