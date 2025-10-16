const mongoose = require("mongoose");

const EducationSchema = new mongoose.Schema(
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
    educations: [{
      institutionName: {
        type: String,
      },
      degree: {
        type: String,
      },
      fieldOfStudy: {
        type: String,
      },
      startDate: {
        type: Date,
      },
      endDate: {
        type: Date,
      },
      currentlyStudying: {
        type: Boolean,
        default: false,
      },
      grade: {
        type: String,
      },
      location: {
        type: String,
      },
      certificate: {
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

module.exports = mongoose.model("Education", EducationSchema);
