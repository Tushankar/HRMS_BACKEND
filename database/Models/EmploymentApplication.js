const mongoose = require("mongoose");

// Employment Application Schema (Exhibit 1a)
const EmploymentApplicationSchema = new mongoose.Schema(
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

    // Applicant Information
    applicantInfo: {
      firstName: { type: String },
      middleName: { type: String },
      lastName: { type: String },
      address: { type: String },
      city: { type: String },
      state: { type: String },
      zip: { type: String },
      phone: { type: String },
      email: { type: String },
      ssn: { type: String },

      desiredSalary: { type: String },
      dateAvailable: { type: Date },
      employmentType: { type: String },
      citizenOfUS: { type: Boolean },
      authorizedToWork: { type: String },
      workedForCompanyBefore: {
        hasWorked: { type: Boolean },
        when: { type: String },
      },
      convictedOfFelony: { type: String },
      felonyExplanation: { type: String },

      // Background Check Fields - Added to Employment Application
      dateOfBirth: { type: Date },
      height: { type: String },
      weight: { type: String },
      sex: { type: String },
      eyeColor: { type: String },
      hairColor: { type: String },
      race: { type: String },
    },

    // Education
    education: {
      highSchool: {
        name: { type: String },
        address: { type: String },
        from: { type: String },
        to: { type: String },
        graduated: { type: String },
        diploma: { type: String },
      },
      college: {
        name: { type: String },
        address: { type: String },
        from: { type: String },
        to: { type: String },
        graduated: { type: String },
        degree: { type: String },
      },
      other: {
        name: { type: String },
        address: { type: String },
        from: { type: String },
        to: { type: String },
        graduated: { type: String },
        degree: { type: String },
      },
    },

    // References
    references: [
      {
        fullName: { type: String },
        relationship: { type: String },
        company: { type: String },
        phone: { type: String },
        address: { type: String },
      },
    ],

    // Previous Employment
    previousEmployments: [
      {
        company: { type: String },
        phone: { type: String },
        address: { type: String },
        supervisor: { type: String },
        jobTitle: { type: String },
        startingSalary: { type: String },
        endingSalary: { type: String },
        responsibilities: { type: String },
        from: { type: String },
        to: { type: String },
        reasonForLeaving: { type: String },
        mayContactSupervisor: { type: String },
      },
    ],



    // Disclaimer and Signature
    signature: { type: String },
    date: { type: String },

    status: {
      type: String,
      enum: [
        "draft",
        "completed",
        "submitted",
        "under_review",
        "approved",
        "rejected",
      ],
      default: "draft",
    },

    // HR Review and Feedback
    hrFeedback: {
      comment: { type: String },
      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
      reviewedAt: { type: Date },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "EmploymentApplication",
  EmploymentApplicationSchema
);
