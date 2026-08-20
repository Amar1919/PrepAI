const mongoose = require("mongoose");

const dsaSubmissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    problemId: {
      type: String,
      required: true,
    },

    problemTitle: {
      type: String,
      required: true,
    },

    language: {
      type: String,
      default: "javascript",
    },

    code: {
      type: String,
      required: true,
    },

    review: {
      type: String,
    },

    verdict: {
      type: String,
      enum: ["reviewed", "error"],
      default: "reviewed",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DSASubmission", dsaSubmissionSchema);
