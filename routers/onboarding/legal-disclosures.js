const express = require("express");
const router = express.Router();
const LegalDisclosures = require("../../database/Models/LegalDisclosures");
const OnboardingApplication = require("../../database/Models/OnboardingApplication");

router.post("/legal-disclosures/save", async (req, res) => {
  try {
    let { applicationId, employeeId, status, hrFeedback, ...disclosures } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
    }

    if (!applicationId || applicationId === 'legal-disclosures' || !applicationId.match(/^[0-9a-fA-F]{24}$/)) {
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

    let legalDisclosures = await LegalDisclosures.findOne({ applicationId });

    if (legalDisclosures) {
      Object.assign(legalDisclosures, disclosures);
      legalDisclosures.status = status || "draft";
      if (hrFeedback) {
        legalDisclosures.hrFeedback = hrFeedback;
      }
      await legalDisclosures.save({ validateBeforeSave: status !== "draft" });
    } else {
      legalDisclosures = new LegalDisclosures({
        applicationId,
        employeeId,
        ...disclosures,
        status: status || "draft",
        hrFeedback: hrFeedback || undefined,
      });
      await legalDisclosures.save({ validateBeforeSave: status !== "draft" });
    }

    if (status === "completed") {
      const application = await OnboardingApplication.findById(applicationId);
      if (application) {
        if (!application.completedForms.includes("legalDisclosures")) {
          application.completedForms.push("legalDisclosures");
        }
        application.completionPercentage = application.calculateCompletionPercentage();
        await application.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Legal disclosures saved successfully",
      data: { applicationId, ...legalDisclosures.toObject() },
    });
  } catch (error) {
    console.error("Error saving legal disclosures:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save legal disclosures",
      error: error.message,
    });
  }
});

router.get("/legal-disclosures/get/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;
    const legalDisclosures = await LegalDisclosures.findOne({ applicationId });

    if (!legalDisclosures) {
      return res.status(404).json({
        success: false,
        message: "Legal disclosures not found",
      });
    }

    res.status(200).json({
      success: true,
      legalDisclosures,
    });
  } catch (error) {
    console.error("Error fetching legal disclosures:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch legal disclosures",
      error: error.message,
    });
  }
});

module.exports = router;
