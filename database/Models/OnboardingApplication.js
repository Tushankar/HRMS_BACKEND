const mongoose = require("mongoose");

// Main Onboarding Application Schema
const OnboardingApplicationSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    applicationStatus: {
      type: String,
      enum: ["draft", "submitted", "hr_accepted", "under_review", "completed", "approved", "rejected"],
      default: "draft",
    },
    submittedAt: {
      type: Date,
    },
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    reviewComments: {
      type: String,
    },
    // HR Decision Tracking
    hrAcceptedAt: {
      type: Date,
    },
    hrAcceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    finalDecision: {
      type: String,
      enum: ["accept", "reject"],
    },
    finalDecisionAt: {
      type: Date,
    },
    finalDecisionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    finalDecisionComments: {
      type: String,
    },
    completionPercentage: {
      type: Number,
      default: 0,
    },
    // Forms completion tracking
    completedForms: [{
      type: String,
    }],
  },
  {
    timestamps: true,
  }
);

// Method to calculate completion percentage
OnboardingApplicationSchema.methods.calculateCompletionPercentage = function() {
  // Total forms: 15 interactive forms + 4 job description acknowledgments + 1 work experience = 20 forms
  const totalForms = 20; 
  const completedFormsCount = this.completedForms.length;
  this.completionPercentage = Math.round((completedFormsCount / totalForms) * 100);
  
  // Auto-submit when all forms are completed
  if (this.completionPercentage === 100 && this.applicationStatus === 'draft') {
    this.applicationStatus = 'submitted';
    this.submittedAt = new Date();
  }
  
  return this.completionPercentage;
};

module.exports = mongoose.model("OnboardingApplication", OnboardingApplicationSchema);
