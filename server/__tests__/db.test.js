jest.mock("mongodb", () => {
  return {
    MongoClient: jest.fn().mockImplementation(() => {
      return {
        connect: jest.fn(),
        db: jest.fn().mockReturnValue("mocked-db"),
      };
    }),
    ServerApiVersion: { v1: "v1" },
  };
});

jest.mock("dotenv", () => ({
  config: jest.fn(),
}));

describe("MongoDB Connection", () => {
  let originalEnv;
  let originalExit;
  let originalConsoleError;
  let originalConsoleLog;

  beforeEach(() => {
    originalEnv = { ...process.env };
    originalExit = process.exit;
    originalConsoleError = console.error;
    originalConsoleLog = console.log;

    process.exit = jest.fn();
    console.error = jest.fn();
    console.log = jest.fn();

    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
    process.exit = originalExit;
    console.error = originalConsoleError;
    console.log = originalConsoleLog;

    jest.resetModules();
  });

  test("should exit with error if MONGO_URI is not defined", () => {
    delete process.env.MONGO_URI;

    require("../db");

    expect(process.exit).toHaveBeenCalledWith(1);
    expect(console.error).toHaveBeenCalledWith(
      "MONGO_URI is not defined! Check your .env file."
    );
  });

  test("should handle connection error", async () => {
    process.env.MONGO_URI = "mongodb://dummy-uri";

    const { MongoClient } = require("mongodb");

    MongoClient.mockImplementation(() => ({
      connect: jest.fn().mockRejectedValueOnce(new Error("Connection error")),
      db: jest.fn(),
    }));

    const connectDB = require("../db");

    await connectDB();

    expect(process.exit).toHaveBeenCalledWith(1);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("MongoDB connection error:")
    );
  });
});
