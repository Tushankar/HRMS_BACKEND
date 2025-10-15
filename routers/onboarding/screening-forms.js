const express = require("express");
const BackgroundCheck = require("../../database/Models/BackgroundCheck");
const BackgroundCheckTemplate = require("../../database/Models/BackgroundCheckTemplate");
const TBSymptomScreen = require("../../database/Models/TBSymptomScreen");
const OrientationChecklist = require("../../database/Models/OrientationChecklist");
const OnboardingApplication = require("../../database/Models/OnboardingApplication");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

const router = express.Router();

// Save or update Background Check form
router.post("/save-background-check", async (req, res) => {
  try {
    console.log(
      "🔵 Background check SAVE request received:",
      JSON.stringify(req.body, null, 2)
    );
    console.log("🔵 Request headers:", req.headers.authorization ? "Bearer token present" : "No token");
    const { applicationId, employeeId, formData, status = "draft" } = req.body;

    console.log("🟡 Parsed request data:");
    console.log("   - applicationId:", applicationId);
    console.log("   - employeeId:", employeeId);
    console.log("   - status:", status);
    console.log("   - formData keys:", formData ? Object.keys(formData) : "formData is null/undefined");

    if (formData) {
      console.log("🟡 FormData detailed structure:");
      console.log("   - applicantInfo:", formData.applicantInfo);
      console.log("   - employmentInfo:", formData.employmentInfo);
      console.log("   - applicantSignature:", formData.applicantSignature);
      console.log("   - applicantSignatureDate:", formData.applicantSignatureDate);

      if (formData.applicantInfo) {
        console.log("🟡 ApplicantInfo field values:");
        console.log("   - lastName:", formData.applicantInfo.lastName);
        console.log("   - firstName:", formData.applicantInfo.firstName);
        console.log("   - height:", formData.applicantInfo.height);
        console.log("   - weight:", formData.applicantInfo.weight);
        console.log("   - eyeColor:", formData.applicantInfo.eyeColor);
        console.log("   - hairColor:", formData.applicantInfo.hairColor);
        console.log("   - sex:", formData.applicantInfo.sex);
        console.log("   - race:", formData.applicantInfo.race);
      }

      if (formData.employmentInfo) {
        console.log("🟡 EmploymentInfo field values:");
        console.log("   - provider:", formData.employmentInfo.provider);
        console.log("   - positionAppliedFor:", formData.employmentInfo.positionAppliedFor);
      }
    }

    if (!applicationId || !employeeId) {
      console.log("Missing required fields:", { applicationId, employeeId });
      return res
        .status(400)
        .json({ message: "Application ID and Employee ID are required" });
    }

    // Check if application exists
    const application = await OnboardingApplication.findById(applicationId);
    if (!application) {
      return res
        .status(404)
        .json({ message: "Onboarding application not found" });
    }

    // Find existing form or create new one
    let backgroundCheckForm = await BackgroundCheck.findOne({ applicationId });

    if (backgroundCheckForm) {
      console.log("🟡 UPDATING existing background check form");
      console.log("🟡 Existing applicantInfo BEFORE merge:", backgroundCheckForm.applicantInfo);
      console.log("🟡 Incoming applicantInfo to merge:", formData.applicantInfo);
      
      // Update existing form - merge formData properly
      if (formData.applicantInfo) {
        // Deep merge for address object
        const existingAddress = backgroundCheckForm.applicantInfo?.address || {};
        const incomingAddress = formData.applicantInfo.address || {};
        
        // Ensure all fields are set, even if empty strings
        // This prevents Mongoose from skipping fields with empty values
        const mergedApplicantInfo = {
          lastName: formData.applicantInfo.lastName ?? backgroundCheckForm.applicantInfo?.lastName ?? "",
          firstName: formData.applicantInfo.firstName ?? backgroundCheckForm.applicantInfo?.firstName ?? "",
          middleInitial: formData.applicantInfo.middleInitial ?? backgroundCheckForm.applicantInfo?.middleInitial ?? "",
          socialSecurityNumber: formData.applicantInfo.socialSecurityNumber ?? backgroundCheckForm.applicantInfo?.socialSecurityNumber ?? "",
          height: formData.applicantInfo.height ?? backgroundCheckForm.applicantInfo?.height ?? "",
          weight: formData.applicantInfo.weight ?? backgroundCheckForm.applicantInfo?.weight ?? "",
          eyeColor: formData.applicantInfo.eyeColor ?? backgroundCheckForm.applicantInfo?.eyeColor ?? "",
          hairColor: formData.applicantInfo.hairColor ?? backgroundCheckForm.applicantInfo?.hairColor ?? "",
          dateOfBirth: formData.applicantInfo.dateOfBirth ?? backgroundCheckForm.applicantInfo?.dateOfBirth ?? null,
          sex: formData.applicantInfo.sex ?? backgroundCheckForm.applicantInfo?.sex ?? "",
          race: formData.applicantInfo.race ?? backgroundCheckForm.applicantInfo?.race ?? "",
          address: {
            street: incomingAddress.street ?? existingAddress.street ?? "",
            city: incomingAddress.city ?? existingAddress.city ?? "",
            state: incomingAddress.state ?? existingAddress.state ?? "",
            zipCode: incomingAddress.zipCode ?? existingAddress.zipCode ?? "",
          },
        };
        
        backgroundCheckForm.applicantInfo = mergedApplicantInfo;
        
        // Mark the nested object as modified for Mongoose to track changes
        backgroundCheckForm.markModified('applicantInfo');
        
        console.log("🟡 Merged applicantInfo AFTER merge:", backgroundCheckForm.applicantInfo);
        console.log("🟡 Physical fields after merge:", {
          height: backgroundCheckForm.applicantInfo.height,
          weight: backgroundCheckForm.applicantInfo.weight,
          eyeColor: backgroundCheckForm.applicantInfo.eyeColor,
          hairColor: backgroundCheckForm.applicantInfo.hairColor,
        });
      }
      if (formData.employmentInfo) {
        backgroundCheckForm.employmentInfo = {
          ...backgroundCheckForm.employmentInfo,
          ...formData.employmentInfo,
        };
        backgroundCheckForm.markModified('employmentInfo');
      }
      if (formData.consentAcknowledgment) {
        backgroundCheckForm.consentAcknowledgment = {
          ...backgroundCheckForm.consentAcknowledgment,
          ...formData.consentAcknowledgment,
        };
        backgroundCheckForm.markModified('consentAcknowledgment');
      }
      if (formData.notification) {
        backgroundCheckForm.notification = {
          ...backgroundCheckForm.notification,
          ...formData.notification,
        };
        backgroundCheckForm.markModified('notification');
      }
      if (formData.applicantSignature) {
        backgroundCheckForm.applicantSignature = formData.applicantSignature;
      }
      if (formData.applicantSignatureDate) {
        backgroundCheckForm.applicantSignatureDate =
          formData.applicantSignatureDate;
      }
      backgroundCheckForm.status = status;
    } else {
      console.log("🟢 CREATING new background check form");
      console.log("🟢 Incoming applicantInfo:", formData.applicantInfo);
      console.log("🟢 Physical fields in new form:", {
        height: formData.applicantInfo?.height,
        weight: formData.applicantInfo?.weight,
        eyeColor: formData.applicantInfo?.eyeColor,
        hairColor: formData.applicantInfo?.hairColor,
      });
      
      // Ensure all fields are explicitly set, even if empty
      const newApplicantInfo = {
        lastName: formData.applicantInfo?.lastName || "",
        firstName: formData.applicantInfo?.firstName || "",
        middleInitial: formData.applicantInfo?.middleInitial || "",
        socialSecurityNumber: formData.applicantInfo?.socialSecurityNumber || "",
        height: formData.applicantInfo?.height || "",
        weight: formData.applicantInfo?.weight || "",
        eyeColor: formData.applicantInfo?.eyeColor || "",
        hairColor: formData.applicantInfo?.hairColor || "",
        dateOfBirth: formData.applicantInfo?.dateOfBirth || null,
        sex: formData.applicantInfo?.sex || "",
        race: formData.applicantInfo?.race || "",
        address: {
          street: formData.applicantInfo?.address?.street || "",
          city: formData.applicantInfo?.address?.city || "",
          state: formData.applicantInfo?.address?.state || "",
          zipCode: formData.applicantInfo?.address?.zipCode || "",
        },
      };
      
      console.log("🟢 Normalized applicantInfo for new form:", newApplicantInfo);
      
      // Create new form with proper structure
      backgroundCheckForm = new BackgroundCheck({
        applicationId,
        employeeId,
        applicantInfo: newApplicantInfo,
        employmentInfo: formData.employmentInfo || {},
        consentAcknowledgment: formData.consentAcknowledgment || {},
        notification: formData.notification || {},
        applicantSignature: formData.applicantSignature || "",
        applicantSignatureDate: formData.applicantSignatureDate || null,
        status,
      });
    }

    console.log("🟢 Saving background check form to database...");
    console.log("🟢 Form data structure before save:", {
      _id: backgroundCheckForm._id,
      applicationId: backgroundCheckForm.applicationId,
      employeeId: backgroundCheckForm.employeeId,
      applicantInfo: backgroundCheckForm.applicantInfo,
      employmentInfo: backgroundCheckForm.employmentInfo,
      signature: backgroundCheckForm.applicantSignature,
      signatureDate: backgroundCheckForm.applicantSignatureDate,
      status: backgroundCheckForm.status,
    });

    await backgroundCheckForm.save();

    console.log("🟢 Background check form saved successfully!");
    console.log("🟢 Saved form ID:", backgroundCheckForm._id);
    console.log("🟢 Final saved data:", backgroundCheckForm.toObject());
    console.log("🟢 VERIFICATION - Physical fields in DB:", {
      height: backgroundCheckForm.applicantInfo?.height,
      weight: backgroundCheckForm.applicantInfo?.weight,
      eyeColor: backgroundCheckForm.applicantInfo?.eyeColor,
      hairColor: backgroundCheckForm.applicantInfo?.hairColor,
      sex: backgroundCheckForm.applicantInfo?.sex,
      race: backgroundCheckForm.applicantInfo?.race,
      dateOfBirth: backgroundCheckForm.applicantInfo?.dateOfBirth,
    });

    // Update application progress
    if (status === "completed") {
      console.log("🟢 Updating application progress (form completed)");
      // Ensure completedForms array exists
      if (!application.completedForms) {
        application.completedForms = [];
      }

      // Check if Background Check is already marked as completed
      if (!application.completedForms.includes("Background Check")) {
        application.completedForms.push("Background Check");
        console.log("🟢 Added 'Background Check' to completed forms list");
      } else {
        console.log("🟢 'Background Check' already in completed forms list");
      }

      application.completionPercentage =
        application.calculateCompletionPercentage();
      await application.save();
      console.log("🟢 Application progress updated:", {
        completedForms: application.completedForms,
        completionPercentage: application.completionPercentage
      });
    } else {
      console.log("📝 Form saved as draft - no progress update needed");
    }

    const message =
      status === "draft"
        ? "Background check form saved as draft"
        : "Background check form completed";

    console.log("🟢 Sending response:", {
      message,
      backgroundCheckId: backgroundCheckForm._id,
      completionPercentage: application.completionPercentage,
      status: status
    });

    res.status(200).json({
      message,
      backgroundCheck: backgroundCheckForm,
      completionPercentage: application.completionPercentage,
    });
  } catch (error) {
    console.error("Error saving background check form:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// HR upload Background Check template
router.post("/hr-upload-background-check-template", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    await BackgroundCheckTemplate.updateMany({}, { isActive: false });
    const template = new BackgroundCheckTemplate({
      filename: req.file.originalname,
      filePath: req.file.path,
      uploadedBy: req.body.uploadedBy || null,
      isActive: true,
    });
    await template.save();
    res.status(200).json({ message: "Template uploaded successfully", template });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

router.get("/get-background-check-template", async (req, res) => {
  try {
    const template = await BackgroundCheckTemplate.findOne({ isActive: true }).sort({ createdAt: -1 });
    if (!template) return res.status(404).json({ message: "No template found" });
    res.status(200).json({ message: "Template retrieved successfully", template });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

router.post("/employee-upload-signed-background-check", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const { applicationId, employeeId } = req.body;
    if (!applicationId) return res.status(400).json({ message: "Application ID is required" });
    let backgroundCheck = await BackgroundCheck.findOne({ applicationId });
    if (!backgroundCheck) backgroundCheck = new BackgroundCheck({ applicationId, employeeId });
    backgroundCheck.employeeUploadedForm = {
      filename: req.file.originalname,
      filePath: req.file.path,
      uploadedAt: new Date(),
    };
    backgroundCheck.status = "submitted";
    await backgroundCheck.save();
    res.status(200).json({ message: "Signed form uploaded successfully", backgroundCheck });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

router.post("/employee-upload-cpr-certificate", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const { applicationId, employeeId } = req.body;
    if (!applicationId) return res.status(400).json({ message: "Application ID is required" });
    let backgroundCheck = await BackgroundCheck.findOne({ applicationId });
    if (!backgroundCheck) backgroundCheck = new BackgroundCheck({ applicationId, employeeId });
    backgroundCheck.cprFirstAidCertificate = {
      filename: req.file.originalname,
      filePath: req.file.path,
      uploadedAt: new Date(),
    };
    await backgroundCheck.save();
    res.status(200).json({ message: "CPR/First Aid certificate uploaded successfully", backgroundCheck });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

router.get("/hr-get-all-background-check-submissions", async (req, res) => {
  try {
    const submissions = await BackgroundCheck.find({ "employeeUploadedForm.filePath": { $exists: true, $ne: null } })
      .populate("employeeId", "firstName lastName email")
      .sort({ "employeeUploadedForm.uploadedAt": -1 });
    res.status(200).json({ message: "Submissions retrieved successfully", submissions });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get Background Check form by application ID
router.get("/get-background-check/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;

    const backgroundCheck = await BackgroundCheck.findOne({ applicationId });

    if (!backgroundCheck) {
      return res
        .status(404)
        .json({ message: "Background check form not found" });
    }

    console.log("🟢 GET Background Check - Retrieved RAW data:", {
      _id: backgroundCheck._id,
      applicationId: backgroundCheck.applicationId,
      hasApplicantInfo: !!backgroundCheck.applicantInfo,
      applicantInfoKeys: backgroundCheck.applicantInfo ? Object.keys(backgroundCheck.applicantInfo) : [],
      applicantInfoRAW: backgroundCheck.applicantInfo,
      backgroundFields: {
        height: backgroundCheck.applicantInfo?.height || "NOT SET",
        weight: backgroundCheck.applicantInfo?.weight || "NOT SET",
        eyeColor: backgroundCheck.applicantInfo?.eyeColor || "NOT SET",
        hairColor: backgroundCheck.applicantInfo?.hairColor || "NOT SET",
        dateOfBirth: backgroundCheck.applicantInfo?.dateOfBirth || "NOT SET",
        sex: backgroundCheck.applicantInfo?.sex || "NOT SET",
        race: backgroundCheck.applicantInfo?.race || "NOT SET",
      }
    });

    res.status(200).json({
      message: "Background check form retrieved successfully",
      backgroundCheck,
    });
  } catch (error) {
    console.error("Error getting background check form:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Get Background Check form by ID (for your frontend route)
router.get("/get-background-check-by-id/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const backgroundCheck = await BackgroundCheck.findById(id);

    if (!backgroundCheck) {
      return res
        .status(404)
        .json({ message: "Background check form not found" });
    }

    res.status(200).json({
      message: "Background check form retrieved successfully",
      backgroundCheck,
    });
  } catch (error) {
    console.error("Error getting background check form by ID:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Update background check results (HR only)
router.put(
  "/update-background-check-results/:applicationId",
  async (req, res) => {
    try {
      const { applicationId } = req.params;
      const { results, reviewedBy } = req.body;

      const backgroundCheck = await BackgroundCheck.findOne({ applicationId });
      if (!backgroundCheck) {
        return res
          .status(404)
          .json({ message: "Background check form not found" });
      }

      backgroundCheck.results = { ...backgroundCheck.results, ...results };
      backgroundCheck.results.reviewedBy = reviewedBy;
      backgroundCheck.results.reviewDate = new Date();

      await backgroundCheck.save();

      res.status(200).json({
        message: "Background check results updated successfully",
        backgroundCheck,
      });
    } catch (error) {
      console.error("Error updating background check results:", error);
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  }
);

// Save or update TB Symptom Screen form
router.post("/save-tb-symptom-screen", async (req, res) => {
  try {
    console.log(
      "TB Symptom Screen request received:",
      JSON.stringify(req.body, null, 2)
    );
    const { applicationId, employeeId, formData, status = "draft" } = req.body;

    if (!applicationId || !employeeId) {
      console.log("Missing required fields:", { applicationId, employeeId });
      return res
        .status(400)
        .json({ message: "Application ID and Employee ID are required" });
    }

    // Check if application exists
    const application = await OnboardingApplication.findById(applicationId);
    if (!application) {
      return res
        .status(404)
        .json({ message: "Onboarding application not found" });
    }

    // Find existing form or create new one
    let tbScreenForm = await TBSymptomScreen.findOne({ applicationId });

    if (tbScreenForm) {
      // Update existing form - merge formData properly
      if (formData.basicInfo) {
        tbScreenForm.basicInfo = {
          ...tbScreenForm.basicInfo,
          ...formData.basicInfo,
        };
      }
      if (formData.lastSkinTest) {
        tbScreenForm.lastSkinTest = {
          ...tbScreenForm.lastSkinTest,
          ...formData.lastSkinTest,
        };
      }
      if (formData.treatmentHistory) {
        tbScreenForm.treatmentHistory = {
          ...tbScreenForm.treatmentHistory,
          ...formData.treatmentHistory,
        };
      }
      if (formData.symptoms) {
        tbScreenForm.symptoms = {
          ...tbScreenForm.symptoms,
          ...formData.symptoms,
        };
      }
      if (formData.actionTaken) {
        tbScreenForm.actionTaken = {
          ...tbScreenForm.actionTaken,
          ...formData.actionTaken,
        };
      }
      if (formData.screeningDate) {
        tbScreenForm.screeningDate = formData.screeningDate;
      }
      if (formData.screenerSignature) {
        tbScreenForm.screenerSignature = formData.screenerSignature;
      }
      // Ignore clientSignature and clientSignatureDate from employee submission (HR-only via submit-notes)
      tbScreenForm.status = status;
    } else {
      // Create new form with proper structure
      tbScreenForm = new TBSymptomScreen({
        applicationId,
        employeeId,
        basicInfo: formData.basicInfo || {},
        lastSkinTest: formData.lastSkinTest || {},
        treatmentHistory: formData.treatmentHistory || {},
        symptoms: formData.symptoms || {},
        actionTaken: formData.actionTaken || {},
        screeningDate: formData.screeningDate || null,
        screenerSignature: formData.screenerSignature || "",
        // clientSignature is HR-only; do not accept from employee submission here
        clientSignature: "",
        clientSignatureDate: null,
        status,
      });
    }

    await tbScreenForm.save();

    // Update application progress
    if (status === "completed") {
      // Ensure completedForms array exists
      if (!application.completedForms) {
        application.completedForms = [];
      }

      // Check if TB Symptom Screen is already marked as completed
      if (!application.completedForms.includes("TB Symptom Screen")) {
        application.completedForms.push("TB Symptom Screen");
      }

      application.completionPercentage =
        application.calculateCompletionPercentage();
      await application.save();
    }

    const message =
      status === "draft"
        ? "TB symptom screen saved as draft"
        : "TB symptom screen completed";

    res.status(200).json({
      message,
      tbSymptomScreen: tbScreenForm,
      completionPercentage: application.completionPercentage,
    });
  } catch (error) {
    console.error("Error saving TB symptom screen:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Get TB Symptom Screen form by application ID
router.get("/get-tb-symptom-screen/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;

    const tbSymptomScreen = await TBSymptomScreen.findOne({ applicationId });

    if (!tbSymptomScreen) {
      return res.status(404).json({ message: "TB symptom screen not found" });
    }

    res.status(200).json({
      message: "TB symptom screen retrieved successfully",
      tbSymptomScreen,
    });
  } catch (error) {
    console.error("Error getting TB symptom screen:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Get TB Symptom Screen form by ID (for your frontend route)
router.get("/get-tb-symptom-screen-by-id/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const tbSymptomScreen = await TBSymptomScreen.findById(id);

    if (!tbSymptomScreen) {
      return res.status(404).json({ message: "TB symptom screen not found" });
    }

    res.status(200).json({
      message: "TB symptom screen retrieved successfully",
      tbSymptomScreen,
    });
  } catch (error) {
    console.error("Error getting TB symptom screen by ID:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Save or update Orientation Checklist
router.post("/save-orientation-checklist", async (req, res) => {
  try {
    const { applicationId, employeeId, formData, status = "draft" } = req.body;

    if (!applicationId || !employeeId) {
      return res
        .status(400)
        .json({ message: "Application ID and Employee ID are required" });
    }

    // Check if application exists
    const application = await OnboardingApplication.findById(applicationId);
    if (!application) {
      return res
        .status(404)
        .json({ message: "Onboarding application not found" });
    }

    // Map form data to schema fields for Orientation Checklist
    const mappedData = {
      // Checkbox acknowledgments - mapping frontend field names to database field names
      readPoliciesAndScope: formData.policies || false,
      understandDuties: formData.duties || false,
      reportEmergencies: formData.emergencies || false,
      reportTBExposure: formData.tbExposure || false,
      understandClientRights: formData.clientRights || false,
      readProcedures: formData.complaints || false,
      understandDocumentation: formData.documentation || false,
      receivedHandbook: formData.handbook || false,
      // Employee signature fields (frontend uses employeeSignature, employeeDate)
      employeeSignature: formData.employeeSignature || "",
      employeeSignatureDate: formData.employeeDate
        ? new Date(formData.employeeDate)
        : null,
      // Agency signature is HR-only: ignored on employee save; set via HR submit-notes
      status,
    };

    // Find existing form or create new one
    let orientationForm = await OrientationChecklist.findOne({ applicationId });

    if (orientationForm) {
      // Update existing form with mapped data
      Object.assign(orientationForm, mappedData);
    } else {
      // Create new form with mapped data
      orientationForm = new OrientationChecklist({
        applicationId,
        employeeId,
        ...mappedData,
      });
    }

    await orientationForm.save();

    // Update application progress
    if (status === "completed") {
      // Ensure completedForms array exists
      if (!application.completedForms) {
        application.completedForms = [];
      }

      // Check if Orientation Checklist is already marked as completed
      if (!application.completedForms.includes("Orientation Checklist")) {
        application.completedForms.push("Orientation Checklist");
      }

      application.completionPercentage =
        application.calculateCompletionPercentage();
      await application.save();
    }

    const message =
      status === "draft"
        ? "Orientation checklist saved as draft"
        : "Orientation checklist completed";

    res.status(200).json({
      message,
      orientationChecklist: orientationForm,
      completionPercentage: application.completionPercentage,
    });
  } catch (error) {
    console.error("Error saving orientation checklist:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Get Orientation Checklist
router.get("/get-orientation-checklist/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;

    const orientationChecklist = await OrientationChecklist.findOne({
      applicationId,
    });

    if (!orientationChecklist) {
      return res
        .status(404)
        .json({ message: "Orientation checklist not found" });
    }

    // Map database fields to frontend field names
    const mappedData = {
      // Map database checkbox fields back to frontend field names
      policies: orientationChecklist.readPoliciesAndScope || false,
      duties: orientationChecklist.understandDuties || false,
      emergencies: orientationChecklist.reportEmergencies || false,
      tbExposure: orientationChecklist.reportTBExposure || false,
      clientRights: orientationChecklist.understandClientRights || false,
      complaints: orientationChecklist.readProcedures || false,
      documentation: orientationChecklist.understandDocumentation || false,
      handbook: orientationChecklist.receivedHandbook || false,
      // Signature fields
      employeeSignature: orientationChecklist.employeeSignature || "",
      employeeDate: orientationChecklist.employeeSignatureDate || null,
      agencySignature: orientationChecklist.agencySignature || "",
      agencyDate: orientationChecklist.agencySignatureDate || null,
      status: orientationChecklist.status || "draft",
    };

    res.status(200).json({
      message: "Orientation checklist retrieved successfully",
      orientationChecklist: mappedData,
    });
  } catch (error) {
    console.error("Error getting orientation checklist:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

module.exports = router;
