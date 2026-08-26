const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const connectDB = require("../config/db");

let mongoServer;

// Tests run against an in-memory MongoDB instance
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();

  // Set environment variables before connecting to DB
  process.env.MONGO_URI = mongoServer.getUri();
  process.env.JWT_SECRET = "test_jwt_secret";
  process.env.GEMINI_API_KEY = "test_key_not_real";
  process.env.NODE_ENV = "test";

  // Connect Mongoose to the in-memory MongoDB
  await connectDB();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  // Close MongoDB connection
  await mongoose.connection.close();

  // Stop the in-memory MongoDB server
  await mongoServer.stop();
});