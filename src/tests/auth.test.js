import request from "supertest";
import app from "../app.js";
import { connectTestDB, closeTestDB } from "./setup.js";
import User from "../models/User.js";

beforeAll(async () => { await connectTestDB(); await User.deleteMany({}); });
afterAll(async () => { await closeTestDB(); });

describe("Auth flow", () => {
  it("register-login", async () => {
    const user = { name: "T", email: "t@example.com", password: "pass1234" };
    const r = await request(app).post("/api/auth/register").send(user);
    expect(r.statusCode).toBe(201);
    const l = await request(app).post("/api/auth/login").send({ email: user.email, password: user.password });
    expect(l.statusCode).toBe(200);
    expect(l.body).toHaveProperty("token");
  });
});
