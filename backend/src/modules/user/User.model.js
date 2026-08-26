const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    avatarColor: {
      type: String,
      default: () => {
        const colors = [
          "#6366f1",
          "#8b5cf6",
          "#ec4899",
          "#14b8a6",
          "#f59e0b",
          "#3b82f6",
        ];

        return colors[Math.floor(Math.random() * colors.length)];
      },
    },

    // Gamification
    xp: {
      type: Number,
      default: 0,
    },

    streak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastActiveDate: { type: Date, default: null },
    },

    badges: [
      {
        id: String,
        name: String,
        description: String,
        icon: String,
        earnedAt: { type: Date, default: Date.now },
      },
    ],

    targetRole: {
      type: String,
      default: "",
    },

    // Password reset
    resetPasswordTokenHash: {
      type: String,
      select: false,
      default: undefined,
    },

    resetPasswordExpires: {
      type: Date,
      select: false,
      default: undefined,
    },

    // Per-user daily AI usage limit
    aiUsage: {
      date: {
        type: String,
        default: null,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);