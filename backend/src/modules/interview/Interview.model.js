const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    role: {
      type: String,
      required: true,
    },

    experience: {
      type: String,
      required: true,
    },

    skills: {
      type: String,
      required: true,
    },

    company: {
      type: String,
      default: "",
    },

    questions: [
      {
        type: String,
      },
    ],

    answers: {
      type: Map,
      of: String,
      default: {},
    },

    feedback: {
      type: Map,
      of: String,
      default: {},
    },

    scores: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Interview", interviewSchema);
