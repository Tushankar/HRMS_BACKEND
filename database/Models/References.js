const mongoose = require("mongoose");

const ReferencesSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OnboardingApplication",
      required: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    references: [{
      referenceName: {
        type: String,
        required: true,
      },
      relationship: {
        type: String,
        required: true,
      },
      company: {
        type: String,
        required: true,
      },
      jobTitle: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      yearsKnown: {
        type: String,
      },
      notes: {
        type: String,
      },
    }],
    status: {
      type: String,
      enum: ["draft", "completed", "submitted", "under_review", "approved", "rejected"],
      default: "draft",
    },
    hrFeedback: {
      comment: { type: String },
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
      reviewedAt: { type: Date }
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("References", ReferencesSchema);
