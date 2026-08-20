const request = require("supertest");
const app = require("../app");

const validUser = {
  name: "Test User",
  email: "testuser@example.com",
  password: "password123",
};

describe("POST /api/auth/signup", () => {
  it("creates a new account and returns a token", async () => {
    const res = await request(app).post("/api/auth/signup").send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(validUser.email);
    // Password must never be echoed back in the response
    expect(res.body.user.password).toBeUndefined();
  });

  it("rejects a duplicate email", async () => {
    await request(app).post("/api/auth/signup").send(validUser);
    const res = await request(app).post("/api/auth/signup").send(validUser);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects a password under 6 characters", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ ...validUser, email: "short@example.com", password: "123" });

    expect(res.status).toBe(400);
  });

  it("rejects a missing name", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ email: "noname@example.com", password: "password123" });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/signup").send(validUser);
  });

  it("logs in with correct credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("rejects an incorrect password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: validUser.email, password: "wrongpassword" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects a nonexistent email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "password123" });

    expect(res.status).toBe(400);
  });
});

describe("Protected routes without a token", () => {
  it("rejects /api/user/stats with 401", async () => {
    const res = await request(app).get("/api/user/stats");
    expect(res.status).toBe(401);
  });

  it("rejects /api/dsa/problems with 401", async () => {
    const res = await request(app).get("/api/dsa/problems");
    expect(res.status).toBe(401);
  });
});

describe("Authenticated flows", () => {
  let token;

  beforeEach(async () => {
    const res = await request(app).post("/api/auth/signup").send(validUser);
    token = res.body.token;
  });

  it("fetches the user's own profile with a valid token", async () => {
    const res = await request(app)
      .get("/api/user/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(validUser.email);
  });

  it("lists DSA problems when authenticated", async () => {
    const res = await request(app)
      .get("/api/dsa/problems")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.problems)).toBe(true);
    expect(res.body.problems.length).toBeGreaterThan(0);
  });

  it("lists company question banks when authenticated", async () => {
    const res = await request(app)
      .get("/api/companies")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.companies)).toBe(true);
  });
});
