const express = require("express");
const router = express.Router();
const References = require("../../database/Models/References");
const OnboardingApplication = require("../../database/Models/OnboardingApplication");

router.post("/references/save", async (req, res) => {
  try {
    let { applicationId, employeeId, references, status, hrFeedback } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
    }

    if (!references || !Array.isArray(references)) {
      return res.status(400).json({
        success: false,
        message: "References must be an array",
      });
    }

    if (!applicationId || applicationId === 'references' || !applicationId.match(/^[0-9a-fA-F]{24}$/)) {
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

    let referencesDoc = await References.findOne({ applicationId });

    if (referencesDoc) {
      referencesDoc.references = references;
      referencesDoc.status = status || "draft";
      if (hrFeedback) {
        referencesDoc.hrFeedback = hrFeedback;
      }
      await referencesDoc.save({ validateBeforeSave: status !== "draft" });
    } else {
      referencesDoc = new References({
        applicationId,
        employeeId,
        references,
        status: status || "draft",
        hrFeedback: hrFeedback || undefined,
      });
      await referencesDoc.save({ validateBeforeSave: status !== "draft" });
    }

    if (status === "completed") {
      const application = await OnboardingApplication.findById(applicationId);
      if (application) {
        if (!application.completedForms.includes("references")) {
          application.completedForms.push("references");
        }
        application.completionPercentage = application.calculateCompletionPercentage();
        await application.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "References saved successfully",
      data: { applicationId, ...referencesDoc.toObject() },
    });
  } catch (error) {
    console.error("Error saving references:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save references",
      error: error.message,
    });
  }
});

router.get("/references/get/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;
    const references = await References.findOne({ applicationId });

    if (!references) {
      return res.status(404).json({
        success: false,
        message: "References not found",
      });
    }

    res.status(200).json({
      success: true,
      references,
    });
  } catch (error) {
    console.error("Error fetching references:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch references",
      error: error.message,
    });
  }
});

module.exports = router;
