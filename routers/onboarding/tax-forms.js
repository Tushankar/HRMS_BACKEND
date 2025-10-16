const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const W4FormTemplate = require("../../database/Models/W4FormTemplate");
const W9FormTemplate = require("../../database/Models/W9FormTemplate");
const I9FormTemplate = require("../../database/Models/I9FormTemplate");
const W4Form = require("../../database/Models/W4Form");
const W9Form = require("../../database/Models/W9Form");
const I9Form = require("../../database/Models/I9Form");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// ========== W4 FORM ENDPOINTS ==========

// HR upload W4 template
router.post("/hr-upload-w4-template", upload.single("file"), async (req, res) => {
  try {
    await W4FormTemplate.updateMany({}, { isActive: false });
    const template = new W4FormTemplate({
      filename: req.file.originalname,
      filePath: req.file.path,
      uploadedBy: req.body.uploadedBy,
      isActive: true,
    });
    await template.save();
    res.json({ success: true, template });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get active W4 template
router.get("/get-w4-template", async (req, res) => {
  try {
    const template = await W4FormTemplate.findOne({ isActive: true });
    res.json({ template });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Save W4 form status
router.post("/save-w4-form", async (req, res) => {
  try {
    const { applicationId, employeeId, status = "draft", hrFeedback } = req.body;
    const updateData = { status };
    if (hrFeedback) {
      updateData.hrFeedback = hrFeedback;
    }
    const w4Form = await W4Form.findOneAndUpdate(
      { applicationId, employeeId },
      updateData,
      { new: true, upsert: true, validateBeforeSave: status !== "draft" }
    );
    res.json({ success: true, w4Form });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get individual W4 submission by ID
router.get("/get-w4-submission/:id", async (req, res) => {
  try {
    const submission = await W4Form.findById(req.params.id)
      .populate("employeeId", "firstName lastName email");
    res.json({ success: true, submission });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Alias endpoint for clarity
router.get("/get-w4-submission-by-id/:id", async (req, res) => {
  try {
    const submission = await W4Form.findById(req.params.id)
      .populate("employeeId", "firstName lastName email");
    res.json({ success: true, submission });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Employee upload signed W4
router.post("/employee-upload-signed-w4", upload.single("file"), async (req, res) => {
  try {
    const { applicationId, employeeId } = req.body;
    const w4Form = await W4Form.findOneAndUpdate(
      { applicationId, employeeId },
      {
        employeeUploadedForm: {
          filename: req.file.originalname,
          filePath: req.file.path,
          uploadedAt: new Date(),
        },
        status: "submitted",
      },
      { new: true, upsert: true }
    );
    res.json({ success: true, w4Form });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// HR get all W4 submissions
router.get("/hr-get-all-w4-submissions", async (req, res) => {
  try {
    const submissions = await W4Form.find({ "employeeUploadedForm.filename": { $exists: true } })
      .populate("employeeId", "firstName lastName email")
      .sort({ "employeeUploadedForm.uploadedAt": -1 });
    res.json({ success: true, submissions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== W9 FORM ENDPOINTS ==========

// HR upload W9 template
router.post("/hr-upload-w9-template", upload.single("file"), async (req, res) => {
  try {
    await W9FormTemplate.updateMany({}, { isActive: false });
    const template = new W9FormTemplate({
      filename: req.file.originalname,
      filePath: req.file.path,
      uploadedBy: req.body.uploadedBy,
      isActive: true,
    });
    await template.save();
    res.json({ success: true, template });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get active W9 template
router.get("/get-w9-template", async (req, res) => {
  try {
    const template = await W9FormTemplate.findOne({ isActive: true });
    res.json({ template });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Save W9 form status
router.post("/save-w9-form", async (req, res) => {
  try {
    const { applicationId, employeeId, status = "draft", hrFeedback } = req.body;
    const updateData = { status };
    if (hrFeedback) {
      updateData.hrFeedback = hrFeedback;
    }
    const w9Form = await W9Form.findOneAndUpdate(
      { applicationId, employeeId },
      updateData,
      { new: true, upsert: true, validateBeforeSave: status !== "draft" }
    );
    res.json({ success: true, w9Form });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Employee upload signed W9
router.post("/employee-upload-signed-w9", upload.single("file"), async (req, res) => {
  try {
    const { applicationId, employeeId } = req.body;
    const w9Form = await W9Form.findOneAndUpdate(
      { applicationId, employeeId },
      {
        employeeUploadedForm: {
          filename: req.file.originalname,
          filePath: req.file.path,
          uploadedAt: new Date(),
        },
        status: "submitted",
      },
      { new: true, upsert: true }
    );
    res.json({ success: true, w9Form });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// HR get all W9 submissions
router.get("/hr-get-all-w9-submissions", async (req, res) => {
  try {
    const submissions = await W9Form.find({ "employeeUploadedForm.filename": { $exists: true } })
      .populate("employeeId", "firstName lastName email")
      .sort({ "employeeUploadedForm.uploadedAt": -1 });
    res.json({ success: true, submissions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== I9 FORM ENDPOINTS ==========

// HR upload I9 template
router.post("/hr-upload-i9-template", upload.single("file"), async (req, res) => {
  try {
    await I9FormTemplate.updateMany({}, { isActive: false });
    const template = new I9FormTemplate({
      filename: req.file.originalname,
      filePath: req.file.path,
      uploadedBy: req.body.uploadedBy,
      isActive: true,
    });
    await template.save();
    res.json({ success: true, template });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get active I9 template
router.get("/get-i9-template", async (req, res) => {
  try {
    const template = await I9FormTemplate.findOne({ isActive: true });
    res.json({ template });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Save I9 form status
router.post("/save-i9-form", async (req, res) => {
  try {
    const { applicationId, employeeId, status = "draft", hrFeedback } = req.body;
    console.log("I9 Form save request:", { applicationId, employeeId, status, hrFeedback });
    const updateData = { status };
    if (hrFeedback) {
      updateData.hrFeedback = hrFeedback;
    }
    const i9Form = await I9Form.findOneAndUpdate(
      { applicationId, employeeId },
      updateData,
      { new: true, upsert: true, validateBeforeSave: status !== "draft" }
    );
    res.json({ success: true, i9Form });
  } catch (error) {
    console.error("Error saving I9 form:", error);
    res.status(500).json({ message: error.message, stack: error.stack });
  }
});

// Employee upload signed I9
router.post("/employee-upload-signed-i9", upload.single("file"), async (req, res) => {
  try {
    const { applicationId, employeeId } = req.body;
    const i9Form = await I9Form.findOneAndUpdate(
      { applicationId, employeeId },
      {
        employeeUploadedForm: {
          filename: req.file.originalname,
          filePath: req.file.path,
          uploadedAt: new Date(),
        },
        status: "submitted",
      },
      { new: true, upsert: true }
    );
    res.json({ success: true, i9Form });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// HR get all I9 submissions
router.get("/hr-get-all-i9-submissions", async (req, res) => {
  try {
    const submissions = await I9Form.find({ "employeeUploadedForm.filename": { $exists: true } })
      .populate("employeeId", "firstName lastName email")
      .sort({ "employeeUploadedForm.uploadedAt": -1 });
    res.json({ success: true, submissions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// HR clear W4 submission
router.delete("/hr-clear-w4-submission/:id", async (req, res) => {
  try {
    await W4Form.findByIdAndUpdate(req.params.id, {
      $unset: { employeeUploadedForm: "" },
      status: "draft"
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// HR clear W9 submission
router.delete("/hr-clear-w9-submission/:id", async (req, res) => {
  try {
    await W9Form.findByIdAndUpdate(req.params.id, {
      $unset: { employeeUploadedForm: "" },
      status: "draft"
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// HR clear I9 submission
router.delete("/hr-clear-i9-submission/:id", async (req, res) => {
  try {
    await I9Form.findByIdAndUpdate(req.params.id, {
      $unset: { employeeUploadedForm: "" },
      status: "draft"
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
