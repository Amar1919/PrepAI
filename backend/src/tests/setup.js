const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

let mongoServer;

// Tests run against an in-memory MongoDB instance instead of a real one -
// no external DB needed to run `npm test`, and nothing touches your real data.
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();
  process.env.JWT_SECRET = "test_jwt_secret";
  process.env.GEMINI_API_KEY = "test_key_not_real";
  process.env.NODE_ENV = "test";
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});
