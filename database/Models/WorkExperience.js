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
    hasPreviousWorkExperience: {
      type: Boolean,
      default: false,
    },
    workExperiences: [
      {
        companyName: {
          type: String,
          required: false, // Changed to false since it's optional when no experience
        },
        jobTitle: {
          type: String,
          required: false, // Changed to false since it's optional when no experience
        },
        employmentType: {
          type: String,
          enum: [
            "Full-time",
            "Part-time",
            "Contract",
            "Internship",
            "Freelance",
          ],
          required: false, // Changed to false since it's optional when no experience
        },
        startDate: {
          type: Date,
          required: false, // Changed to false since it's optional when no experience
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
          required: false, // Changed to false since it's optional when no experience
        },
        supervisorName: {
          type: String,
        },
        supervisorContact: {
          type: String,
        },
        keyResponsibilities: {
          type: String,
          required: false, // Changed to false since it's optional when no experience
        },
        reasonForLeaving: {
          type: String,
        },
        proofDocument: {
          type: String, // File path for uploaded proof
        },
      },
    ],
    status: {
      type: String,
<<<<<<< HEAD
      enum: [
        "draft",
        "completed",
        "submitted",
        "under_review",
        "approved",
        "rejected",
      ],
=======
      enum: ["draft", "completed", "submitted", "under_review", "approved", "rejected"],
>>>>>>> 2b64909206c6db504362635dd2490b80343b4bd1
      default: "draft",
    },
    hrFeedback: {
      comment: { type: String },
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
<<<<<<< HEAD
      reviewedAt: { type: Date },
=======
      reviewedAt: { type: Date }
>>>>>>> 2b64909206c6db504362635dd2490b80343b4bd1
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("WorkExperience", WorkExperienceSchema);
