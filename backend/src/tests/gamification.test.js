const mongoose = require("mongoose");
const User = require("../modules/user/User.model");
const { recordActivity } = require("../shared/utils/gamification");

async function makeUser(overrides = {}) {
  return User.create({
    name: "Streak Tester",
    email: `streak-${Date.now()}-${Math.random()}@example.com`,
    password: "hashed_not_real",
    ...overrides,
  });
}

describe("recordActivity", () => {
  it("starts a streak at 1 for a brand new user", async () => {
    const user = await makeUser();
    const result = await recordActivity(user._id, { xp: 10 });

    expect(result.streak.current).toBe(1);
    expect(result.xp).toBe(10);
  });

  it("does not increment streak twice on the same day", async () => {
    const user = await makeUser();
    await recordActivity(user._id, { xp: 10 });
    const second = await recordActivity(user._id, { xp: 10 });

    expect(second.streak.current).toBe(1);
    expect(second.xp).toBe(20);
  });

  it("resets streak to 1 if the last activity was more than a day ago", async () => {
    const user = await makeUser();
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    await User.findByIdAndUpdate(user._id, {
      "streak.current": 5,
      "streak.longest": 5,
      "streak.lastActiveDate": threeDaysAgo,
    });

    const result = await recordActivity(user._id, { xp: 5 });
    expect(result.streak.current).toBe(1);
    expect(result.streak.longest).toBe(5); // longest is preserved
  });

  it("awards the streak_3 badge on a 3-day streak", async () => {
    const user = await makeUser();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    await User.findByIdAndUpdate(user._id, {
      "streak.current": 2,
      "streak.longest": 2,
      "streak.lastActiveDate": yesterday,
    });

    const result = await recordActivity(user._id, { xp: 5 });
    expect(result.streak.current).toBe(3);
    expect(result.newBadges.some((b) => b.id === "streak_3")).toBe(true);
  });

  it("does not re-award a badge the user already has", async () => {
    const user = await makeUser();
    await recordActivity(user._id, { xp: 10, badgeCandidates: ["first_interview"] });
    const second = await recordActivity(user._id, { xp: 10, badgeCandidates: ["first_interview"] });

    expect(second.newBadges.some((b) => b.id === "first_interview")).toBe(false);
  });
});
