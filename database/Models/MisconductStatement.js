const mongoose = require("mongoose");

// Staff Misconduct Abuse Statement Form Schema (Exhibit 2)
const MisconductStatementSchema = new mongoose.Schema(
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

    // Admin uploaded template file
    adminUploadedFile: {
      filename: { type: String },
      originalName: { type: String },
      path: { type: String },
      mimeType: { type: String },
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
      uploadedAt: { type: Date },
    },

    // Employee's downloaded and signed file
    employeeUploadedFile: {
      filename: { type: String },
      originalName: { type: String },
      path: { type: String },
      mimeType: { type: String },
      uploadedAt: { type: Date },
    },

    // Track employee's download activity
    downloadedAt: { type: Date },
    downloadCount: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["pending", "downloaded", "in_progress", "submitted", "under_review", "approved", "rejected"],
      default: "pending",
    },

    // HR Review and Feedback
    hrFeedback: {
      comment: {
        type: String,
      },
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
      reviewedAt: {
        type: Date,
      },
    },

    // Submission tracking
    submittedAt: { type: Date },
    reviewedAt: { type: Date },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "MisconductStatement",
  MisconductStatementSchema
);
