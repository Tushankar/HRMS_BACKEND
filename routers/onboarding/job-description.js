const express = require("express");
const router = express.Router();
const PCAJobDescription = require("../../database/Models/PCAJobDescription");
const PCAJobDescriptionTemplate = require("../../database/Models/PCAJobDescriptionTemplate");
const CNAJobDescription = require("../../database/Models/CNAJobDescription");
const CNAJobDescriptionTemplate = require("../../database/Models/CNAJobDescriptionTemplate");
const LPNJobDescription = require("../../database/Models/LPNJobDescription");
const LPNJobDescriptionTemplate = require("../../database/Models/LPNJobDescriptionTemplate");
const RNJobDescription = require("../../database/Models/RNJobDescription");
const RNJobDescriptionTemplate = require("../../database/Models/RNJobDescriptionTemplate");
const OnboardingApplication = require("../../database/Models/OnboardingApplication");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Helper function to get the correct model based on job type
const getJobDescriptionModel = (jobType) => {
  switch (jobType.toUpperCase()) {
    case "PCA":
      return PCAJobDescription;
    case "CNA":
      return CNAJobDescription;
    case "LPN":
      return LPNJobDescription;
    case "RN":
      return RNJobDescription;
    default:
      throw new Error(`Invalid job description type: ${jobType}`);
  }
};

// Save Job Description Acknowledgment (Draft or Complete)
router.post("/save-job-description", async (req, res) => {
  try {
    const { applicationId, employeeId, formData, status } = req.body;

    // Validate required fields
    if (!applicationId || !employeeId) {
      return res.status(400).json({
        success: false,
        message: "Application ID and Employee ID are required",
      });
    }

    const jobType = formData?.jobDescriptionType || "RN";
    const JobModel = getJobDescriptionModel(jobType);

    // Check if job description already exists
    let jobDesc = await JobModel.findOne({
      applicationId,
    });

    if (jobDesc) {
      // Update existing record - only update signature fields
      if (formData) {
        // Update staff signature if provided
        if (formData.staffSignature !== undefined) {
          jobDesc.staffSignature = {
            signature: formData.staffSignature.signature || "",
            date: formData.staffSignature.date
              ? new Date(formData.staffSignature.date)
              : null,
            digitalSignature: formData.staffSignature.digitalSignature || true,
          };
        }

        // Update supervisor signature if provided
        if (formData.supervisorSignature !== undefined) {
          jobDesc.supervisorSignature = {
            signature: formData.supervisorSignature.signature || "",
            supervisorName: formData.supervisorSignature.supervisorName || "",
            supervisorTitle: formData.supervisorSignature.supervisorTitle || "",
            date: formData.supervisorSignature.date
              ? new Date(formData.supervisorSignature.date)
              : null,
            digitalSignature:
              formData.supervisorSignature.digitalSignature || true,
          };
        }

        // Update acknowledgment if provided
        if (formData.acknowledgment) {
          jobDesc.acknowledgment = formData.acknowledgment;
        }

        // Update comments if provided
        if (formData.comments) {
          jobDesc.comments = formData.comments;
        }

        // Update other basic fields if provided
        if (formData.jobTitle) {
          jobDesc.jobTitle = formData.jobTitle;
        }
      }

      jobDesc.status = status || jobDesc.status;
      await jobDesc.save();
    } else {
      // Create new record with minimal data
      const newJobDescData = {
        applicationId,
        employeeId,
        status: status || "draft",
      };

      // Add signature data if provided
      if (formData) {
        if (formData.staffSignature !== undefined) {
          newJobDescData.staffSignature = {
            signature: formData.staffSignature.signature || "",
            date: formData.staffSignature.date
              ? new Date(formData.staffSignature.date)
              : null,
            digitalSignature: formData.staffSignature.digitalSignature || true,
          };
        }

        if (formData.supervisorSignature !== undefined) {
          newJobDescData.supervisorSignature = {
            signature: formData.supervisorSignature.signature || "",
            supervisorName: formData.supervisorSignature.supervisorName || "",
            supervisorTitle: formData.supervisorSignature.supervisorTitle || "",
            date: formData.supervisorSignature.date
              ? new Date(formData.supervisorSignature.date)
              : null,
            digitalSignature:
              formData.supervisorSignature.digitalSignature || true,
          };
        }

        // Add acknowledgment if provided
        if (formData.acknowledgment) {
          newJobDescData.acknowledgment = formData.acknowledgment;
        }

        // Add comments if provided
        if (formData.comments) {
          newJobDescData.comments = formData.comments;
        }

        // Add other fields if provided
        if (formData.jobTitle) {
          newJobDescData.jobTitle = formData.jobTitle;
        }
      }

      jobDesc = new JobModel(newJobDescData);
      await jobDesc.save();
    }

    // Update main application completion if completed
    if (status === "completed") {
      const application = await OnboardingApplication.findById(applicationId);
      if (application) {
        // Add to completed forms if not already there
        const formKey = `jobDescription${jobType}`;
        if (!application.completedForms.includes(formKey)) {
          application.completedForms.push(formKey);
        }

        application.completionPercentage =
          application.calculateCompletionPercentage();
        await application.save();

        return res.status(200).json({
          success: true,
          message: `${jobType} Job description completed successfully`,
          completionPercentage: application.completionPercentage,
          data: { jobDescription: jobDesc },
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `${jobType} Job description saved as ${status || "draft"}`,
      data: { jobDescription: jobDesc },
    });
  } catch (error) {
    console.error("Error saving job description acknowledgment:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Get Job Description by Application ID and Type
router.get("/get-job-description/:applicationId/:jobType", async (req, res) => {
  try {
    const { applicationId, jobType } = req.params;

    const JobModel = getJobDescriptionModel(jobType);
    const jobDesc = await JobModel.findOne({
      applicationId,
    });

    if (!jobDesc) {
      return res.status(404).json({
        success: false,
        message: `${jobType} Job description not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: { jobDescription: jobDesc },
    });
  } catch (error) {
    console.error("Error retrieving job description:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Get All Job Descriptions for an Application
router.get("/get-all-job-descriptions/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Query all 4 job description models
    const [pcaJobDesc, cnaJobDesc, lpnJobDesc, rnJobDesc] = await Promise.all([
      PCAJobDescription.findOne({ applicationId }).lean(),
      CNAJobDescription.findOne({ applicationId }).lean(),
      LPNJobDescription.findOne({ applicationId }).lean(),
      RNJobDescription.findOne({ applicationId }).lean(),
    ]);

    const jobDescriptions = [];
    if (pcaJobDesc) jobDescriptions.push({ type: "PCA", ...pcaJobDesc });
    if (cnaJobDesc) jobDescriptions.push({ type: "CNA", ...cnaJobDesc });
    if (lpnJobDesc) jobDescriptions.push({ type: "LPN", ...lpnJobDesc });
    if (rnJobDesc) jobDescriptions.push({ type: "RN", ...rnJobDesc });

    res.status(200).json({
      success: true,
      count: jobDescriptions.length,
      data: { jobDescriptions },
    });
  } catch (error) {
    console.error("Error retrieving job descriptions:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// Supervisor Sign Job Description
router.put("/supervisor-sign-job-description/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { supervisorSignature } = req.body;

    // Try to find the job description in each model to determine the type
    let jobDesc = null;
    let jobType = null;

    const models = [
      { model: PCAJobDescription, type: "PCA" },
      { model: CNAJobDescription, type: "CNA" },
      { model: LPNJobDescription, type: "LPN" },
      { model: RNJobDescription, type: "RN" },
    ];

    for (const { model, type } of models) {
      jobDesc = await model.findById(id);
      if (jobDesc) {
        jobType = type;
        break;
      }
    }

    if (!jobDesc) {
      return res.status(404).json({
        success: false,
        message: "Job description not found",
      });
    }

    // Update supervisor signature
    jobDesc.supervisorSignature = supervisorSignature;
    jobDesc.status = "completed";
    await jobDesc.save();

    // Update main application
    const application = await OnboardingApplication.findById(
      jobDesc.applicationId
    );
    if (application) {
      const formKey = `jobDescription${jobType}`;
      if (!application.completedForms.includes(formKey)) {
        application.completedForms.push(formKey);
      }

      application.completionPercentage =
        application.calculateCompletionPercentage();
      await application.save();
    }

    res.status(200).json({
      success: true,
      message: `${jobType} Job description completed with supervisor signature`,
      data: { jobDescription: jobDesc },
    });
  } catch (error) {
    console.error("Error with supervisor signature:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// NEW SIMPLIFIED API - For direct job description form submission
router.post("/job-description/:applicationId/:jobType", async (req, res) => {
  try {
    const { applicationId, jobType } = req.params;
    const {
      staffSignature,
      supervisorSignature,
      status = "draft",
      employeeId,
    } = req.body;

    console.log("Received job description submission:", {
      applicationId,
      jobType,
      staffSignature,
      supervisorSignature,
      status,
      employeeId,
    });

    // Validate job type
    const validJobTypes = ["PCA", "CNA", "LPN", "RN"];
    if (!validJobTypes.includes(jobType.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid job type. Must be one of: ${validJobTypes.join(
          ", "
        )}`,
      });
    }

    const JobModel = getJobDescriptionModel(jobType);

    // Check if job description already exists
    let jobDesc = await JobModel.findOne({ applicationId });

    if (jobDesc) {
      // Update existing record
      if (staffSignature) {
        jobDesc.staffSignature = staffSignature;
      }
      // Supervisor signature is HR-only. Ignore any supervisorSignature provided by employee submissions to prevent unauthorized overwrites.
      if (supervisorSignature) {
        console.log(
          "⚠️  Ignoring supervisorSignature from employee submission - supervisor signatures must be set via HR workflows"
        );
      }
      jobDesc.status = status;
      await jobDesc.save();
    } else {
      // For new records, we need employeeId
      let finalEmployeeId = employeeId;

      if (!finalEmployeeId) {
        // Try to get employeeId from the OnboardingApplication
        const application = await OnboardingApplication.findById(applicationId);
        if (application && application.employeeId) {
          finalEmployeeId = application.employeeId;
        } else {
          // Use a default test employeeId for development
          finalEmployeeId = "67e0f8770c6feb6ba99d11d2";
          console.log(
            "Using default employeeId for development:",
            finalEmployeeId
          );
        }
      }

      // Create new record - MUST include employeeId. Do NOT initialize supervisorSignature here; keep DB schema intact but let HR set it later.
      const newJobDescData = {
        applicationId,
        employeeId: finalEmployeeId,
        staffSignature: staffSignature || {
          signature: "",
          date: null,
          digitalSignature: false,
        },
        status,
      };

      jobDesc = new JobModel(newJobDescData);
      await jobDesc.save();
    }

    // Update main application if completed
    if (status === "completed") {
      const application = await OnboardingApplication.findById(applicationId);
      if (application) {
        const formKey = `jobDescription${jobType.toUpperCase()}`;
        if (!application.completedForms.includes(formKey)) {
          application.completedForms.push(formKey);
        }
        application.completionPercentage =
          application.calculateCompletionPercentage();
        await application.save();
      }
    }

    res.status(200).json({
      success: true,
      message: `${jobType.toUpperCase()} Job Description ${
        status === "completed" ? "submitted" : "saved"
      } successfully`,
      data: jobDesc,
    });
  } catch (error) {
    console.error("Error saving job description:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// GET Job Description by Application ID and Type - Simplified
router.get("/job-description/:applicationId/:jobType", async (req, res) => {
  try {
    const { applicationId, jobType } = req.params;

    console.log("Fetching job description:", { applicationId, jobType });

    const JobModel = getJobDescriptionModel(jobType);
    const jobDesc = await JobModel.findOne({ applicationId });

    if (!jobDesc) {
      // Return empty data structure for new forms instead of 404
      return res.status(200).json({
        success: true,
        message: `${jobType.toUpperCase()} Job Description not found - returning empty form`,
        data: {
          staffSignature: {
            signature: "",
            signatureImage: "",
            date: null,
            digitalSignature: false,
          },
          supervisorSignature: {
            signature: "",
            supervisorName: "",
            supervisorTitle: "",
            date: null,
            digitalSignature: false,
          },
          status: "draft",
        },
      });
    }

    res.status(200).json({
      success: true,
      data: jobDesc,
    });
  } catch (error) {
    console.error("Error retrieving job description:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// HR upload PCA Job Description template
router.post("/hr-upload-pca-job-description-template", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { uploadedBy } = req.body;

    await PCAJobDescriptionTemplate.updateMany({}, { isActive: false });

    const template = new PCAJobDescriptionTemplate({
      filename: req.file.originalname,
      filePath: req.file.path,
      uploadedBy: uploadedBy || null,
      isActive: true,
    });

    await template.save();

    res.status(200).json({
      message: "PCA Job Description template uploaded successfully",
      template,
    });
  } catch (error) {
    console.error("Error uploading template:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get active PCA Job Description template
router.get("/get-pca-job-description-template", async (req, res) => {
  try {
    const template = await PCAJobDescriptionTemplate.findOne({ isActive: true }).sort({ createdAt: -1 });

    if (!template) {
      return res.status(404).json({ message: "No template found" });
    }

    res.status(200).json({
      message: "Template retrieved successfully",
      template,
    });
  } catch (error) {
    console.error("Error getting template:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Employee upload signed PCA Job Description form
router.post("/employee-upload-signed-pca-job-description", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { applicationId, employeeId } = req.body;

    if (!applicationId) {
      return res.status(400).json({ message: "Application ID is required" });
    }

    let pcaJobDescription = await PCAJobDescription.findOne({ applicationId });

    if (!pcaJobDescription) {
      pcaJobDescription = new PCAJobDescription({
        applicationId,
        employeeId,
      });
    }

    pcaJobDescription.employeeUploadedForm = {
      filename: req.file.originalname,
      filePath: req.file.path,
      uploadedAt: new Date(),
    };
    pcaJobDescription.status = "submitted";

    await pcaJobDescription.save();

    res.status(200).json({
      message: "Signed PCA Job Description form uploaded successfully",
      pcaJobDescription,
    });
  } catch (error) {
    console.error("Error uploading signed form:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get all employees' uploaded PCA Job Description forms (for HR)
router.get("/hr-get-all-pca-job-description-submissions", async (req, res) => {
  try {
    const submissions = await PCAJobDescription.find({
      "employeeUploadedForm.filePath": { $exists: true, $ne: null },
    })
      .populate("employeeId", "firstName lastName email")
      .sort({ "employeeUploadedForm.uploadedAt": -1 });

    res.status(200).json({
      message: "PCA Job Description submissions retrieved successfully",
      submissions,
    });
  } catch (error) {
    console.error("Error getting submissions:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// HR upload CNA Job Description template
router.post("/hr-upload-cna-job-description-template", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { uploadedBy } = req.body;

    await CNAJobDescriptionTemplate.updateMany({}, { isActive: false });

    const template = new CNAJobDescriptionTemplate({
      filename: req.file.originalname,
      filePath: req.file.path,
      uploadedBy: uploadedBy || null,
      isActive: true,
    });

    await template.save();

    res.status(200).json({
      message: "CNA Job Description template uploaded successfully",
      template,
    });
  } catch (error) {
    console.error("Error uploading template:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get active CNA Job Description template
router.get("/get-cna-job-description-template", async (req, res) => {
  try {
    const template = await CNAJobDescriptionTemplate.findOne({ isActive: true }).sort({ createdAt: -1 });

    if (!template) {
      return res.status(404).json({ message: "No template found" });
    }

    res.status(200).json({
      message: "Template retrieved successfully",
      template,
    });
  } catch (error) {
    console.error("Error getting template:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Employee upload signed CNA Job Description form
router.post("/employee-upload-signed-cna-job-description", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { applicationId, employeeId } = req.body;

    if (!applicationId) {
      return res.status(400).json({ message: "Application ID is required" });
    }

    let cnaJobDescription = await CNAJobDescription.findOne({ applicationId });

    if (!cnaJobDescription) {
      cnaJobDescription = new CNAJobDescription({
        applicationId,
        employeeId,
      });
    }

    cnaJobDescription.employeeUploadedForm = {
      filename: req.file.originalname,
      filePath: req.file.path,
      uploadedAt: new Date(),
    };
    cnaJobDescription.status = "submitted";

    await cnaJobDescription.save();

    res.status(200).json({
      message: "Signed CNA Job Description form uploaded successfully",
      cnaJobDescription,
    });
  } catch (error) {
    console.error("Error uploading signed form:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get all employees' uploaded CNA Job Description forms (for HR)
router.get("/hr-get-all-cna-job-description-submissions", async (req, res) => {
  try {
    const submissions = await CNAJobDescription.find({
      "employeeUploadedForm.filePath": { $exists: true, $ne: null },
    })
      .populate("employeeId", "firstName lastName email")
      .sort({ "employeeUploadedForm.uploadedAt": -1 });

    res.status(200).json({
      message: "CNA Job Description submissions retrieved successfully",
      submissions,
    });
  } catch (error) {
    console.error("Error getting submissions:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// HR upload LPN Job Description template
router.post("/hr-upload-lpn-job-description-template", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const { uploadedBy } = req.body;
    await LPNJobDescriptionTemplate.updateMany({}, { isActive: false });
    const template = new LPNJobDescriptionTemplate({
      filename: req.file.originalname,
      filePath: req.file.path,
      uploadedBy: uploadedBy || null,
      isActive: true,
    });
    await template.save();
    res.status(200).json({ message: "LPN Job Description template uploaded successfully", template });
  } catch (error) {
    console.error("Error uploading template:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

router.get("/get-lpn-job-description-template", async (req, res) => {
  try {
    const template = await LPNJobDescriptionTemplate.findOne({ isActive: true }).sort({ createdAt: -1 });
    if (!template) return res.status(404).json({ message: "No template found" });
    res.status(200).json({ message: "Template retrieved successfully", template });
  } catch (error) {
    console.error("Error getting template:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

router.post("/employee-upload-signed-lpn-job-description", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const { applicationId, employeeId } = req.body;
    if (!applicationId) return res.status(400).json({ message: "Application ID is required" });
    let lpnJobDescription = await LPNJobDescription.findOne({ applicationId });
    if (!lpnJobDescription) {
      lpnJobDescription = new LPNJobDescription({ applicationId, employeeId });
    }
    lpnJobDescription.employeeUploadedForm = {
      filename: req.file.originalname,
      filePath: req.file.path,
      uploadedAt: new Date(),
    };
    lpnJobDescription.status = "submitted";
    await lpnJobDescription.save();
    res.status(200).json({ message: "Signed LPN Job Description form uploaded successfully", lpnJobDescription });
  } catch (error) {
    console.error("Error uploading signed form:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

router.get("/hr-get-all-lpn-job-description-submissions", async (req, res) => {
  try {
    const submissions = await LPNJobDescription.find({ "employeeUploadedForm.filePath": { $exists: true, $ne: null } })
      .populate("employeeId", "firstName lastName email")
      .sort({ "employeeUploadedForm.uploadedAt": -1 });
    res.status(200).json({ message: "LPN Job Description submissions retrieved successfully", submissions });
  } catch (error) {
    console.error("Error getting submissions:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

router.post("/hr-upload-rn-job-description-template", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const { uploadedBy } = req.body;
    await RNJobDescriptionTemplate.updateMany({}, { isActive: false });
    const template = new RNJobDescriptionTemplate({ filename: req.file.originalname, filePath: req.file.path, uploadedBy: uploadedBy || null, isActive: true });
    await template.save();
    res.status(200).json({ message: "RN Job Description template uploaded successfully", template });
  } catch (error) {
    console.error("Error uploading template:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

router.get("/get-rn-job-description-template", async (req, res) => {
  try {
    const template = await RNJobDescriptionTemplate.findOne({ isActive: true }).sort({ createdAt: -1 });
    if (!template) return res.status(404).json({ message: "No template found" });
    res.status(200).json({ message: "Template retrieved successfully", template });
  } catch (error) {
    console.error("Error getting template:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

router.post("/employee-upload-signed-rn-job-description", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const { applicationId, employeeId } = req.body;
    if (!applicationId) return res.status(400).json({ message: "Application ID is required" });
    let rnJobDescription = await RNJobDescription.findOne({ applicationId });
    if (!rnJobDescription) rnJobDescription = new RNJobDescription({ applicationId, employeeId });
    rnJobDescription.employeeUploadedForm = { filename: req.file.originalname, filePath: req.file.path, uploadedAt: new Date() };
    rnJobDescription.status = "submitted";
    await rnJobDescription.save();
    res.status(200).json({ message: "Signed RN Job Description form uploaded successfully", rnJobDescription });
  } catch (error) {
    console.error("Error uploading signed form:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

router.get("/hr-get-all-rn-job-description-submissions", async (req, res) => {
  try {
    const submissions = await RNJobDescription.find({ "employeeUploadedForm.filePath": { $exists: true, $ne: null } })
      .populate("employeeId", "firstName lastName email")
      .sort({ "employeeUploadedForm.uploadedAt": -1 });
    res.status(200).json({ message: "RN Job Description submissions retrieved successfully", submissions });
  } catch (error) {
    console.error("Error getting submissions:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Unified endpoint - Get template by position type
router.get("/get-job-description-template/:positionType", async (req, res) => {
  try {
    const { positionType } = req.params;
    let template;
    
    switch (positionType.toUpperCase()) {
      case "PCA":
        template = await PCAJobDescriptionTemplate.findOne({ isActive: true }).sort({ createdAt: -1 });
        break;
      case "CNA":
        template = await CNAJobDescriptionTemplate.findOne({ isActive: true }).sort({ createdAt: -1 });
        break;
      case "LPN":
        template = await LPNJobDescriptionTemplate.findOne({ isActive: true }).sort({ createdAt: -1 });
        break;
      case "RN":
        template = await RNJobDescriptionTemplate.findOne({ isActive: true }).sort({ createdAt: -1 });
        break;
      default:
        return res.status(400).json({ message: "Invalid position type" });
    }
    
    if (!template) {
      return res.status(404).json({ message: "No template found" });
    }
    
    res.status(200).json({ message: "Template retrieved successfully", template });
  } catch (error) {
    console.error("Error getting template:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Unified endpoint - Employee upload signed job description
router.post("/employee-upload-signed-job-description", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    
    const { applicationId, employeeId, positionType } = req.body;
    
    if (!applicationId) return res.status(400).json({ message: "Application ID is required" });
    if (!positionType) return res.status(400).json({ message: "Position type is required" });
    
    let jobDescription;
    const JobModel = getJobDescriptionModel(positionType);
    
    jobDescription = await JobModel.findOne({ applicationId });
    
    if (!jobDescription) {
      jobDescription = new JobModel({ applicationId, employeeId });
    }
    
    jobDescription.employeeUploadedForm = {
      filename: req.file.originalname,
      filePath: req.file.path,
      uploadedAt: new Date(),
    };
    jobDescription.status = "submitted";
    
    await jobDescription.save();
    
    // Update application completion
    const application = await OnboardingApplication.findById(applicationId);
    if (application) {
      const formKey = `jobDescription${positionType.toUpperCase()}`;
      if (!application.completedForms.includes(formKey)) {
        application.completedForms.push(formKey);
      }
      application.completionPercentage = application.calculateCompletionPercentage();
      await application.save();
    }
    
    res.status(200).json({ 
      message: `Signed ${positionType} Job Description form uploaded successfully`, 
      jobDescription 
    });
  } catch (error) {
    console.error("Error uploading signed form:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// HR clear PCA submission
router.delete("/hr-clear-pca-submission/:id", async (req, res) => {
  try {
    await PCAJobDescription.findByIdAndUpdate(req.params.id, {
      $unset: { employeeUploadedForm: "" },
      status: "draft"
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// HR clear CNA submission
router.delete("/hr-clear-cna-submission/:id", async (req, res) => {
  try {
    await CNAJobDescription.findByIdAndUpdate(req.params.id, {
      $unset: { employeeUploadedForm: "" },
      status: "draft"
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// HR clear LPN submission
router.delete("/hr-clear-lpn-submission/:id", async (req, res) => {
  try {
    await LPNJobDescription.findByIdAndUpdate(req.params.id, {
      $unset: { employeeUploadedForm: "" },
      status: "draft"
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// HR clear RN submission
router.delete("/hr-clear-rn-submission/:id", async (req, res) => {
  try {
    await RNJobDescription.findByIdAndUpdate(req.params.id, {
      $unset: { employeeUploadedForm: "" },
      status: "draft"
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Save job description status (draft/completed)
router.post("/job-description/save-status", async (req, res) => {
  try {
    const { applicationId, employeeId, positionType, status } = req.body;

    if (!applicationId || !employeeId || !positionType) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const JobModel = getJobDescriptionModel(positionType);
    let jobDesc = await JobModel.findOne({ applicationId });

    if (jobDesc) {
      jobDesc.status = status || "draft";
      await jobDesc.save({ validateBeforeSave: status !== "draft" });
    } else {
      jobDesc = new JobModel({
        applicationId,
        employeeId,
        status: status || "draft",
      });
      await jobDesc.save({ validateBeforeSave: status !== "draft" });
    }

    res.status(200).json({
      success: true,
      message: `Job description status saved as ${status}`,
      data: jobDesc,
    });
  } catch (error) {
    console.error("Error saving job description status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

module.exports = router;
