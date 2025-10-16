const mongoose = require("mongoose");

const WorkExperienceSchema = new mongoose.Schema(
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
    workExperiences: [{
      companyName: {
        type: String,
        required: true,
      },
      jobTitle: {
        type: String,
        required: true,
      },
      employmentType: {
        type: String,
        enum: ["Full-time", "Part-time", "Contract", "Internship", "Freelance"],
        required: true,
      },
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
      },
      currentlyWorkingHere: {
        type: Boolean,
        default: false,
      },
      location: {
        type: String,
        required: true,
      },
      supervisorName: {
        type: String,
      },
      supervisorContact: {
        type: String,
      },
      keyResponsibilities: {
        type: String,
        required: true,
      },
      reasonForLeaving: {
        type: String,
      },
      proofDocument: {
        type: String, // File path for uploaded proof
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

module.exports = mongoose.model("WorkExperience", WorkExperienceSchema);