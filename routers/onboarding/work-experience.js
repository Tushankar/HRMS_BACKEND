const express = require("express");
const router = express.Router();
const WorkExperience = require("../../database/Models/WorkExperience");
const OnboardingApplication = require("../../database/Models/OnboardingApplication");

// Save work experience
router.post("/work-experience/save", async (req, res) => {
  try {
    console.log("💼 [WorkExperience] Save request received");
    console.log("💼 Request body:", JSON.stringify(req.body, null, 2));
    
    let { applicationId, employeeId, workExperiences, status } = req.body;

    console.log("💼 Parsed data:");
    console.log("   - applicationId:", applicationId);
    console.log("   - employeeId:", employeeId);
    console.log("   - workExperiences count:", workExperiences?.length);
    console.log("   - status:", status);

    // Validate employeeId
    if (!employeeId) {
      console.log("❌ [WorkExperience] Missing employeeId");
      return res.status(400).json({
        success: false,
        message: "Employee ID is required",
      });
    }

    // Validate workExperiences
    if (!workExperiences || !Array.isArray(workExperiences)) {
      console.log("❌ [WorkExperience] Invalid workExperiences format");
      return res.status(400).json({
        success: false,
        message: "Work experiences must be an array",
      });
    }

    // If applicationId is invalid or not provided, find or create one
    if (!applicationId || applicationId === 'work-experience' || !applicationId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log("⚠️ [WorkExperience] Invalid applicationId, looking for existing application");
      let application = await OnboardingApplication.findOne({ employeeId });
      if (!application) {
        console.log("📝 [WorkExperience] Creating new application for employee:", employeeId);
        application = new OnboardingApplication({
          employeeId,
          applicationStatus: "draft",
        });
        await application.save();
        console.log("✅ [WorkExperience] New application created:", application._id);
      } else {
        console.log("✅ [WorkExperience] Found existing application:", application._id);
      }
      applicationId = application._id;
    }

    console.log("💼 [WorkExperience] Using applicationId:", applicationId);
    let workExp = await WorkExperience.findOne({ applicationId });

    if (workExp) {
      console.log("🔄 [WorkExperience] Updating existing work experience");
      console.log("   - Old count:", workExp.workExperiences?.length);
      console.log("   - New count:", workExperiences.length);
      workExp.workExperiences = workExperiences;
      workExp.status = status || "draft";
      await workExp.save({ validateBeforeSave: status !== "draft" });
      console.log("✅ [WorkExperience] Work experience updated");
    } else {
      console.log("📝 [WorkExperience] Creating new work experience document");
      workExp = new WorkExperience({
        applicationId,
        employeeId,
        workExperiences,
        status: status || "draft",
      });
      await workExp.save({ validateBeforeSave: status !== "draft" });
      console.log("✅ [WorkExperience] New work experience created:", workExp._id);
    }

    // Update OnboardingApplication if completed
    if (status === "completed") {
      console.log("📋 [WorkExperience] Updating application completion status");
      const application = await OnboardingApplication.findById(applicationId);
      if (application) {
        if (!application.completedForms.includes("workExperience")) {
          application.completedForms.push("workExperience");
          console.log("✅ [WorkExperience] Added to completed forms");
        }
        application.completionPercentage = application.calculateCompletionPercentage();
        await application.save();
        console.log("✅ [WorkExperience] Application updated, completion:", application.completionPercentage + "%");
      }
    }

    console.log("🎉 [WorkExperience] Save successful!");
    console.log("💼 Saved work experience data:", {
      _id: workExp._id,
      applicationId: workExp.applicationId,
      employeeId: workExp.employeeId,
      experiencesCount: workExp.workExperiences?.length,
      status: workExp.status
    });

    res.status(200).json({
      success: true,
      message: "Work experience saved successfully",
      data: workExp,
    });
  } catch (error) {
    console.error("❌ [WorkExperience] Error saving work experience:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Failed to save work experience",
      error: error.message,
    });
  }
});

// Get work experience
router.get("/work-experience/get/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;

    const workExp = await WorkExperience.findOne({ applicationId });

    if (!workExp) {
      return res.status(404).json({
        success: false,
        message: "Work experience not found",
      });
    }

    res.status(200).json({
      success: true,
      workExperience: workExp,
    });
  } catch (error) {
    console.error("Error fetching work experience:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch work experience",
      error: error.message,
    });
  }
});

module.exports = router;
