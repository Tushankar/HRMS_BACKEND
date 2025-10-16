const mongoose = require("mongoose");

// Professional Experience Form Schema
const ProfessionalExperienceSchema = new mongoose.Schema(
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

    // Work Experience (Array of experiences)
    workExperience: [{
      companyName: { type: String },
      jobTitle: { type: String },
      employmentType: { 
        type: String,
        enum: ["Full-time", "Part-time", "Contract", "Internship", "Freelance"]
      },
      startDate: { type: Date },
      endDate: { type: Date },
      currentlyWorking: { type: Boolean, default: false },
      location: { type: String }, // City, State, Country
      supervisorName: { type: String },
      supervisorContact: { type: String }, // Email or Phone
      responsibilities: { type: String }, // textarea
      reasonForLeaving: { type: String },
      documentPath: { type: String } // Upload path for offer/relieving letter
    }],

    // Job Preferences
    expectedSalary: { type: String },
    salaryType: { 
      type: String,
      enum: ["per hour", "per annum"],
      default: "per annum"
    },
    preferredWorkLocation: { type: String },
    willingToRelocate: { type: Boolean },
    availabilityToStart: { type: Date },
    employmentTypePreference: { 
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Remote"]
    },

    // References (Array of references)
    references: [{
      name: { type: String },
      relationship: { type: String },
      company: { type: String },
      contactNumber: { type: String },
      email: { type: String }
    }],

    // Legal Questions
    workedWithCompanyBefore: { type: Boolean },
    legallyAuthorizedToWork: { type: Boolean },
    requireVisaSponsorship: { type: Boolean },
    convictedOfFelony: { type: Boolean },
    felonyExplanation: { type: String },

    // Military Service
    hasMilitaryService: { type: Boolean, default: false },
    militaryService: {
      branch: { type: String },
      from: { type: String },
      to: { type: String },
      rankAtDischarge: { type: String },
      typeOfDischarge: { type: String },
      otherThanHonorable: { type: String },
      mayContactSupervisor: { type: String },
      reasonForLeaving: { type: String },
    },

    // Documents
    resumePath: { type: String },
    coverLetterPath: { type: String },
    portfolioPath: { type: String },

    // Internal status tracking
    status: {
      type: String,
      enum: ["draft", "completed", "submitted", "under_review", "approved", "rejected"],
      default: "draft",
    },

    // HR Review and Feedback
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

module.exports = mongoose.model("ProfessionalExperience", ProfessionalExperienceSchema);