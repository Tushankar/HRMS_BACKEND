const express = require("express");
const router = express.Router();
const Education = require("../../database/Models/Education");
const OnboardingApplication = require("../../database/Models/OnboardingApplication");

// Save education
router.post("/education/save", async (req, res) => {
  try {
    let { applicationId, employeeId, educations, status, hrFeedback } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
    }

    if (!educations || !Array.isArray(educations)) {
      return res.status(400).json({
        success: false,
        message: "Educations must be an array",
      });
    }

    if (!applicationId || applicationId === 'education' || !applicationId.match(/^[0-9a-fA-F]{24}$/)) {
      let application = await OnboardingApplication.findOne({ employeeId });
      if (!application) {
        application = new OnboardingApplication({
          employeeId,
          applicationStatus: "draft",
        });
        await application.save();
      }
      applicationId = application._id;
    }

    let education = await Education.findOne({ applicationId });

    if (education) {
      education.educations = educations;
      education.status = status || "draft";
      if (hrFeedback) {
        education.hrFeedback = hrFeedback;
      }
      await education.save({ validateBeforeSave: status !== "draft" });
    } else {
      education = new Education({
        applicationId,
        employeeId,
        educations,
        status: status || "draft",
        hrFeedback: hrFeedback || undefined,
      });
      await education.save({ validateBeforeSave: status !== "draft" });
    }

    if (status === "completed") {
      const application = await OnboardingApplication.findById(applicationId);
      if (application) {
        if (!application.completedForms.includes("education")) {
          application.completedForms.push("education");
        }
        application.completionPercentage = application.calculateCompletionPercentage();
        await application.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Education saved successfully",
      data: { applicationId, ...education.toObject() },
    });
  } catch (error) {
    console.error("Error saving education:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save education",
      error: error.message,
    });
  }
});

// Get education
router.get("/education/get/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;
    const education = await Education.findOne({ applicationId });

    if (!education) {
      return res.status(404).json({
        success: false,
        message: "Education not found",
      });
    }

    res.status(200).json({
      success: true,
      education,
    });
  } catch (error) {
    console.error("Error fetching education:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch education",
      error: error.message,
    });
  }
});

module.exports = router;
