const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const MisconductStatement = require("../../database/Models/MisconductStatement");
const MisconductStatementTemplate = require("../../database/Models/MisconductStatementTemplate");
const OnboardingApplication = require("../../database/Models/OnboardingApplication");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../uploads/misconduct-statements");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "misconduct-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Admin: Upload misconduct statement template
router.post("/admin-upload-template", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { uploadedBy } = req.body;

    // Deactivate previous templates
    await MisconductStatementTemplate.updateMany({}, { isActive: false });

    // Create new template
    const templateData = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      mimeType: req.file.mimetype,
    };
    
    if (uploadedBy) {
      templateData.uploadedBy = uploadedBy;
    }
    
    const template = new MisconductStatementTemplate(templateData);

    await template.save();

    res.status(200).json({
      message: "Misconduct statement template uploaded successfully",
      template,
    });
  } catch (error) {
    console.error("Error uploading template:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get active misconduct statement template
router.get("/get-template", async (req, res) => {
  try {
    const template = await MisconductStatementTemplate.findOne({ isActive: true }).sort({ createdAt: -1 });

    if (!template) {
      return res.status(404).json({ message: "No active template found" });
    }

    res.status(200).json({
      message: "Template retrieved successfully",
      template,
    });
  } catch (error) {
    console.error("Error fetching template:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Download misconduct statement template
router.get("/download-template/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;

    const template = await MisconductStatementTemplate.findOne({ isActive: true }).sort({ createdAt: -1 });

    if (!template) {
      return res.status(404).json({ message: "No active template found" });
    }

    // Update download tracking
    await MisconductStatement.findOneAndUpdate(
      { applicationId },
      {
        $inc: { downloadCount: 1 },
        $set: { downloadedAt: new Date(), status: "downloaded" },
      },
      { upsert: true, new: true }
    );

    // Send file
    res.download(template.path, template.originalName);
  } catch (error) {
    console.error("Error downloading template:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Employee: Upload signed misconduct statement
router.post("/employee-upload-signed", upload.single("signedForm"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { applicationId, employeeId } = req.body;

    if (!applicationId || !employeeId) {
      return res.status(400).json({ message: "Application ID and Employee ID are required" });
    }

    // Find or create misconduct statement
    let misconductStatement = await MisconductStatement.findOne({ applicationId });

    if (!misconductStatement) {
      misconductStatement = new MisconductStatement({
        applicationId,
        employeeId,
      });
    }

    // Update with employee uploaded file
    misconductStatement.employeeUploadedFile = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      mimeType: req.file.mimetype,
      uploadedAt: new Date(),
    };
    misconductStatement.status = "submitted";
    misconductStatement.submittedAt = new Date();

    await misconductStatement.save();

    // Update onboarding application progress
    const application = await OnboardingApplication.findById(applicationId);
    if (application) {
      if (!application.completedForms) {
        application.completedForms = [];
      }
      if (!application.completedForms.includes("Staff Statement of Misconduct")) {
        application.completedForms.push("Staff Statement of Misconduct");
      }
      application.completionPercentage = application.calculateCompletionPercentage();
      await application.save();
    }

    res.status(200).json({
      message: "Signed misconduct statement uploaded successfully",
      misconductStatement,
      completionPercentage: application?.completionPercentage || 0,
    });
  } catch (error) {
    console.error("Error uploading signed form:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get misconduct statement by application ID
router.get("/get-misconduct-statement/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;

    const misconductStatement = await MisconductStatement.findOne({ applicationId });

    if (!misconductStatement) {
      return res.status(404).json({ message: "Misconduct statement not found" });
    }

    res.status(200).json({
      message: "Misconduct statement retrieved successfully",
      misconductStatement,
    });
  } catch (error) {
    console.error("Error fetching misconduct statement:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Download employee's signed misconduct statement
router.get("/download-signed/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;

    const misconductStatement = await MisconductStatement.findOne({ applicationId });

    if (!misconductStatement || !misconductStatement.employeeUploadedFile) {
      return res.status(404).json({ message: "Signed form not found" });
    }

    res.download(
      misconductStatement.employeeUploadedFile.path,
      misconductStatement.employeeUploadedFile.originalName
    );
  } catch (error) {
    console.error("Error downloading signed form:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

module.exports = router;
