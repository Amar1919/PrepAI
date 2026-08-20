const User = require("../../modules/user/User.model");

const BADGE_DEFS = {
  first_interview: { name: "First Steps", description: "Generated your first mock interview", icon: "🎯" },
  first_resume: { name: "Resume Ready", description: "Analyzed your first resume", icon: "📄" },
  streak_3: { name: "On a Roll", description: "3-day practice streak", icon: "🔥" },
  streak_7: { name: "Committed", description: "7-day practice streak", icon: "⚡" },
  streak_30: { name: "Unstoppable", description: "30-day practice streak", icon: "🏆" },
  dsa_5: { name: "Problem Solver", description: "Solved 5 DSA problems", icon: "🧩" },
  xp_500: { name: "Rising Star", description: "Earned 500 XP", icon: "⭐" },
};

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isYesterday(a, b) {
  const yesterday = new Date(b);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(a, yesterday);
}

/**
 * Call whenever a user performs a meaningful practice action
 * (generating an interview, evaluating an answer, analyzing a resume, solving a DSA problem).
 * Updates streaks, awards XP, and unlocks badges. Returns the updated { xp, streak, newBadges }.
 */
async function recordActivity(userId, { xp = 10, badgeCandidates = [] } = {}) {
  const user = await User.findById(userId);
  if (!user) return null;

  const now = new Date();

  if (!user.streak.lastActiveDate) {
    user.streak.current = 1;
  } else if (isSameDay(user.streak.lastActiveDate, now)) {
    // already active today, streak unchanged
  } else if (isYesterday(user.streak.lastActiveDate, now)) {
    user.streak.current += 1;
  } else {
    user.streak.current = 1;
  }

  user.streak.longest = Math.max(user.streak.longest, user.streak.current);
  user.streak.lastActiveDate = now;
  user.xp += xp;

  const earned = new Set(user.badges.map((b) => b.id));
  const toCheck = [...badgeCandidates];

  if (user.streak.current >= 3) toCheck.push("streak_3");
  if (user.streak.current >= 7) toCheck.push("streak_7");
  if (user.streak.current >= 30) toCheck.push("streak_30");
  if (user.xp >= 500) toCheck.push("xp_500");

  const newBadges = [];
  for (const badgeId of toCheck) {
    if (!earned.has(badgeId) && BADGE_DEFS[badgeId]) {
      const badge = { id: badgeId, ...BADGE_DEFS[badgeId] };
      user.badges.push(badge);
      newBadges.push(badge);
      earned.add(badgeId);
    }
  }

  await user.save();

  return {
    xp: user.xp,
    streak: user.streak,
    newBadges,
  };
}

module.exports = { recordActivity, BADGE_DEFS };
