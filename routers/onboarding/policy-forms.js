const express = require("express");
const MisconductStatement = require("../../database/Models/MisconductStatement");
const CodeOfEthics = require("../../database/Models/CodeOfEthics");
const CodeOfEthicsTemplate = require("../../database/Models/CodeOfEthicsTemplate");
const ServiceDeliveryPolicy = require("../../database/Models/ServiceDeliveryPolicy");
const ServiceDeliveryPolicyTemplate = require("../../database/Models/ServiceDeliveryPolicyTemplate");
const NonCompeteAgreement = require("../../database/Models/NonCompeteAgreement");
const NonCompeteTemplate = require("../../database/Models/NonCompeteTemplate");
const OnboardingApplication = require("../../database/Models/OnboardingApplication");
const EmploymentApplication = require("../../database/Models/EmploymentApplication");
const I9Form = require("../../database/Models/I9Form");
const I9FormTemplate = require("../../database/Models/I9FormTemplate");
const W4Form = require("../../database/Models/W4Form");
const W4FormTemplate = require("../../database/Models/W4FormTemplate");
const W9Form = require("../../database/Models/W9Form");
const W9FormTemplate = require("../../database/Models/W9FormTemplate");
const RNJobDescription = require("../../database/Models/RNJobDescription");
const RNJobDescriptionTemplate = require("../../database/Models/RNJobDescriptionTemplate");
const LPNJobDescription = require("../../database/Models/LPNJobDescription");
const LPNJobDescriptionTemplate = require("../../database/Models/LPNJobDescriptionTemplate");
const CNAJobDescription = require("../../database/Models/CNAJobDescription");
const CNAJobDescriptionTemplate = require("../../database/Models/CNAJobDescriptionTemplate");
const PCAJobDescription = require("../../database/Models/PCAJobDescription");
const PCAJobDescriptionTemplate = require("../../database/Models/PCAJobDescriptionTemplate");
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

const router = express.Router();

// Save or update Misconduct Statement form
router.post("/save-misconduct-statement", async (req, res) => {
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

    console.log("Raw formData received:", formData); // Debug log

    // Map flat form data to nested schema structure
    const mappedData = {
      staffInfo: {
        staffTitle: formData.staffTitle || "",
        employeeName: formData.employeeName || "",
        employmentPosition: formData.employmentPosition || "",
      },
      acknowledgment: {
        understandsCodeOfConduct: formData.understandsCodeOfConduct || false,
        noMisconductHistory: formData.noMisconductHistory || false,
        formReadAndUnderstood: formData.formReadAndUnderstood || false,
      },
      employeeSignature: {
        printedName: formData.employeeName || "",
        position: formData.employmentPosition || "",
        signature: formData.signature || "",
        date: formData.date ? new Date(formData.date) : null,
      },
      verifier: {
        statement: formData.witnessStatement || "",
        printedName: formData.witnessName || "",
        // Employee should NOT set witness signature
        signature: "",
        date: formData.witnessDate ? new Date(formData.witnessDate) : null,
      },
      notaryInfo: {
        state: "Georgia", // Default as per schema
        day: formData.notaryDate ? parseInt(formData.notaryDate) : null,
        month: formData.notaryMonth || "",
        year: formData.notaryYear ? parseInt(formData.notaryYear) : null,
        // Employee should NOT set notary signature
        notarySignature: "",
        notarySeal: formData.notarySeal || "",
      },
      status,
    };

    console.log("Mapped data for database:", mappedData); // Debug log

    // Find existing form or create new one
    let misconductForm = await MisconductStatement.findOne({ applicationId });

    if (misconductForm) {
      // Update existing form with mapped data
      Object.assign(misconductForm, mappedData);
    } else {
      // Create new form with mapped data
      misconductForm = new MisconductStatement({
        applicationId,
        employeeId,
        ...mappedData,
      });
    }

    await misconductForm.save({ validateBeforeSave: status !== "draft" });

    // Update application progress
    if (status === "completed") {
      // Ensure completedForms array exists
      if (!application.completedForms) {
        application.completedForms = [];
      }

      // Check if Staff Statement of Misconduct is already marked as completed
      if (
        !application.completedForms.includes("Staff Statement of Misconduct")
      ) {
        application.completedForms.push("Staff Statement of Misconduct");
      }

      application.completionPercentage =
        application.calculateCompletionPercentage();
      await application.save();
    }

    const message =
      status === "draft"
        ? "Misconduct statement saved as draft"
        : "Misconduct statement completed";

    res.status(200).json({
      message,
      misconductStatement: misconductForm,
      completionPercentage: application.completionPercentage,
    });
  } catch (error) {
    console.error("Error saving misconduct statement:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Get Misconduct Statement form
router.get("/get-misconduct-statement/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;

    const misconductStatement = await MisconductStatement.findOne({
      applicationId,
    });

    if (!misconductStatement) {
      return res
        .status(404)
        .json({ message: "Misconduct statement not found" });
    }

    res.status(200).json({
      message: "Misconduct statement retrieved successfully",
      misconductStatement,
    });
  } catch (error) {
    console.error("Error getting misconduct statement:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Save or update Code of Ethics form
router.post("/save-code-of-ethics", async (req, res) => {
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

    // Map form data to schema fields
    const mappedData = {
      acknowledgment: formData.acknowledgment || false,
      employeeSignature: formData.signature || formData.employeeSignature || "",
      signatureDate: formData.date
        ? new Date(formData.date)
        : formData.signatureDate
        ? new Date(formData.signatureDate)
        : null,
      status,
    };

    // Find existing form or create new one
    let codeOfEthicsForm = await CodeOfEthics.findOne({ applicationId });

    if (codeOfEthicsForm) {
      // Update existing form with mapped data
      Object.assign(codeOfEthicsForm, mappedData);
    } else {
      // Create new form with mapped data
      codeOfEthicsForm = new CodeOfEthics({
        applicationId,
        employeeId,
        ...mappedData,
      });
    }

    await codeOfEthicsForm.save({ validateBeforeSave: status !== "draft" });

    // Update application progress
    if (status === "completed") {
      // Ensure completedForms array exists
      if (!application.completedForms) {
        application.completedForms = [];
      }

      // Check if Code of Ethics is already marked as completed
      if (!application.completedForms.includes("Code of Ethics")) {
        application.completedForms.push("Code of Ethics");
      }

      application.completionPercentage =
        application.calculateCompletionPercentage();
      await application.save();
    }

    const message =
      status === "draft"
        ? "Code of ethics saved as draft"
        : "Code of ethics completed";

    res.status(200).json({
      message,
      codeOfEthics: codeOfEthicsForm,
      completionPercentage: application.completionPercentage,
    });
  } catch (error) {
    console.error("Error saving code of ethics:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Get Code of Ethics form
router.get("/get-code-of-ethics/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;

    const codeOfEthics = await CodeOfEthics.findOne({ applicationId });

    if (!codeOfEthics) {
      return res.status(404).json({ message: "Code of ethics form not found" });
    }

    // Map database fields to frontend field names
    const mappedData = {
      ...codeOfEthics.toObject(),
      signature: codeOfEthics.employeeSignature || "",
      date: codeOfEthics.signatureDate || null,
    };

    res.status(200).json({
      message: "Code of ethics retrieved successfully",
      codeOfEthics: mappedData,
    });
  } catch (error) {
    console.error("Error getting code of ethics:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// HR upload Code of Ethics template
router.post("/hr-upload-code-of-ethics-template", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { uploadedBy } = req.body;

    // Deactivate previous templates
    await CodeOfEthicsTemplate.updateMany({}, { isActive: false });

    // Create new template
    const template = new CodeOfEthicsTemplate({
      filename: req.file.originalname,
      filePath: req.file.path,
      uploadedBy: uploadedBy || null,
      isActive: true,
    });

    await template.save();

    res.status(200).json({
      message: "Code of Ethics template uploaded successfully",
      template,
    });
  } catch (error) {
    console.error("Error uploading template:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get active Code of Ethics template
router.get("/get-code-of-ethics-template", async (req, res) => {
  try {
    const template = await CodeOfEthicsTemplate.findOne({ isActive: true }).sort({ createdAt: -1 });

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

// Employee upload signed Code of Ethics form
router.post("/employee-upload-signed-code-of-ethics", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { applicationId, employeeId } = req.body;

    if (!applicationId) {
      return res.status(400).json({ message: "Application ID is required" });
    }

    let codeOfEthics = await CodeOfEthics.findOne({ applicationId });

    if (!codeOfEthics) {
      codeOfEthics = new CodeOfEthics({
        applicationId,
        employeeId,
      });
    }

    codeOfEthics.employeeUploadedForm = {
      filename: req.file.originalname,
      filePath: req.file.path,
      uploadedAt: new Date(),
    };
    codeOfEthics.status = "submitted";

    await codeOfEthics.save();

    res.status(200).json({
      message: "Signed Code of Ethics form uploaded successfully",
      codeOfEthics,
    });
  } catch (error) {
    console.error("Error uploading signed form:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get all employees' uploaded Code of Ethics forms (for HR)
router.get("/hr-get-all-code-of-ethics-submissions", async (req, res) => {
  try {
    const submissions = await CodeOfEthics.find({
      "employeeUploadedForm.filePath": { $exists: true, $ne: null },
    })
      .populate("employeeId", "firstName lastName email")
      .sort({ "employeeUploadedForm.uploadedAt": -1 });

    res.status(200).json({
      message: "Code of Ethics submissions retrieved successfully",
      submissions,
    });
  } catch (error) {
    console.error("Error getting submissions:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Save or update Service Delivery Policy form
router.post("/save-service-delivery-policy", async (req, res) => {
  try {
    const { applicationId, employeeId, formData, hrFeedback, status = "draft" } = req.body;

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

    // Find existing form
    let serviceDeliveryForm = await ServiceDeliveryPolicy.findOne({ applicationId });

    // Handle HR feedback-only update
    if (!formData && hrFeedback) {
      if (!serviceDeliveryForm) {
        return res.status(404).json({ message: "Service delivery policy form not found" });
      }
      serviceDeliveryForm.hrFeedback = hrFeedback;
      serviceDeliveryForm.status = "under_review";
      await serviceDeliveryForm.save();
      return res.status(200).json({
        message: "HR feedback saved successfully",
        serviceDeliveryPolicy: serviceDeliveryForm,
      });
    }

    // Map form data to schema fields for Service Delivery Policy
    const mappedData = {
      // Policy acknowledgments
      policy1Acknowledged: formData.policy1Acknowledged || false,
      policy2Acknowledged: formData.policy2Acknowledged || false,
      policy3Acknowledged: formData.policy3Acknowledged || false,
      policy4Acknowledged: formData.policy4Acknowledged || false,
      policy5Acknowledged: formData.policy5Acknowledged || false,
      // Employee signature fields (frontend uses employeeSignature, employeeDate)
      employeeSignature: formData.employeeSignature || "",
      employeeSignatureDate: formData.employeeDate
        ? new Date(formData.employeeDate)
        : null,
      // Supervisor signature fields are HR-only. Do NOT accept from employee form submit.
      // Keep existing supervisorSignature fields unchanged here; they will be set via HR notes endpoint.
      status,
    };

    if (serviceDeliveryForm) {
      // Update existing form with mapped data
      Object.assign(serviceDeliveryForm, mappedData);
    } else {
      // Create new form with mapped data
      serviceDeliveryForm = new ServiceDeliveryPolicy({
        applicationId,
        employeeId,
        ...mappedData,
      });
    }

    await serviceDeliveryForm.save({ validateBeforeSave: status !== "draft" });

    // Update application progress
    if (status === "completed") {
      // Ensure completedForms array exists
      if (!application.completedForms) {
        application.completedForms = [];
      }

      // Check if Service Delivery Policies is already marked as completed
      if (!application.completedForms.includes("Service Delivery Policies")) {
        application.completedForms.push("Service Delivery Policies");
      }

      application.completionPercentage =
        application.calculateCompletionPercentage();
      await application.save();
    }

    const message =
      status === "draft"
        ? "Service delivery policy saved as draft"
        : "Service delivery policy completed";

    res.status(200).json({
      message,
      serviceDeliveryPolicy: serviceDeliveryForm,
      completionPercentage: application.completionPercentage,
    });
  } catch (error) {
    console.error("Error saving service delivery policy:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Get Service Delivery Policy form
router.get("/get-service-delivery-policy/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;

    const serviceDeliveryPolicy = await ServiceDeliveryPolicy.findOne({
      applicationId,
    });

    if (!serviceDeliveryPolicy) {
      return res
        .status(404)
        .json({ message: "Service delivery policy form not found" });
    }

    // Map database fields to frontend field names
    const mappedData = {
      ...serviceDeliveryPolicy.toObject(),
      employeeDate: serviceDeliveryPolicy.employeeSignatureDate || null,
      agencySignature: serviceDeliveryPolicy.supervisorSignature || "",
      agencyDate: serviceDeliveryPolicy.supervisorSignatureDate || null,
    };

    res.status(200).json({
      message: "Service delivery policy retrieved successfully",
      serviceDeliveryPolicy: mappedData,
    });
  } catch (error) {
    console.error("Error getting service delivery policy:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// HR upload Service Delivery Policy template
router.post("/hr-upload-service-delivery-policy-template", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { uploadedBy } = req.body;

    await ServiceDeliveryPolicyTemplate.updateMany({}, { isActive: false });

    const template = new ServiceDeliveryPolicyTemplate({
      filename: req.file.originalname,
      filePath: req.file.path,
      uploadedBy: uploadedBy || null,
      isActive: true,
    });

    await template.save();

    res.status(200).json({
      message: "Service Delivery Policy template uploaded successfully",
      template,
    });
  } catch (error) {
    console.error("Error uploading template:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get active Service Delivery Policy template
router.get("/get-service-delivery-policy-template", async (req, res) => {
  try {
    const template = await ServiceDeliveryPolicyTemplate.findOne({ isActive: true }).sort({ createdAt: -1 });

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

// Employee upload signed Service Delivery Policy form
router.post("/employee-upload-signed-service-delivery-policy", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { applicationId, employeeId } = req.body;

    if (!applicationId) {
      return res.status(400).json({ message: "Application ID is required" });
    }

    let serviceDeliveryPolicy = await ServiceDeliveryPolicy.findOne({ applicationId });

    if (!serviceDeliveryPolicy) {
      serviceDeliveryPolicy = new ServiceDeliveryPolicy({
        applicationId,
        employeeId,
      });
    }

    serviceDeliveryPolicy.employeeUploadedForm = {
      filename: req.file.originalname,
      filePath: req.file.path,
      uploadedAt: new Date(),
    };
    serviceDeliveryPolicy.status = "submitted";

    await serviceDeliveryPolicy.save();

    res.status(200).json({
      message: "Signed Service Delivery Policy form uploaded successfully",
      serviceDeliveryPolicy,
    });
  } catch (error) {
    console.error("Error uploading signed form:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get all employees' uploaded Service Delivery Policy forms (for HR)
router.get("/hr-get-all-service-delivery-policy-submissions", async (req, res) => {
  try {
    const submissions = await ServiceDeliveryPolicy.find({
      "employeeUploadedForm.filePath": { $exists: true, $ne: null },
    })
      .populate("employeeId", "firstName lastName email")
      .sort({ "employeeUploadedForm.uploadedAt": -1 });

    res.status(200).json({
      message: "Service Delivery Policy submissions retrieved successfully",
      submissions,
    });
  } catch (error) {
    console.error("Error getting submissions:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Save or update Non-Compete Agreement form
router.post("/save-non-compete-agreement", async (req, res) => {
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

    // Map form data to schema fields for Non-Compete Agreement
    const mappedData = {
      // Effective date mapping
      effectiveDate: {
        day: formData.agreementDate
          ? new Date(formData.agreementDate).getDate()
          : null,
        month:
          formData.agreementMonth ||
          (formData.agreementDate
            ? new Date(formData.agreementDate).toLocaleDateString("en-US", {
                month: "long",
              })
            : ""),
        year: formData.agreementYear
          ? parseInt(formData.agreementYear)
          : formData.agreementDate
          ? new Date(formData.agreementDate).getFullYear()
          : null,
      },
      // Employee info mapping
      employeeInfo: {
        employeeName: formData.employeeName || "",
        address: formData.employeeAddress || "",
        position: formData.jobTitle || "",
      },
      // Signature mapping
      employeeSignature: formData.employeeSignature || "",
      employeeSignatureDate: formData.agreementDate
        ? new Date(formData.agreementDate)
        : null,
      status,
    };

    // Find existing form or create new one
    let nonCompeteForm = await NonCompeteAgreement.findOne({ applicationId });

    if (nonCompeteForm) {
      // Update existing form with mapped data
      Object.assign(nonCompeteForm, mappedData);
    } else {
      // Create new form with mapped data
      nonCompeteForm = new NonCompeteAgreement({
        applicationId,
        employeeId,
        ...mappedData,
      });
    }

    await nonCompeteForm.save({ validateBeforeSave: status !== "draft" });

    // Update application progress
    if (status === "completed") {
      // Ensure completedForms array exists
      if (!application.completedForms) {
        application.completedForms = [];
      }

      // Check if Non-Compete Agreement is already marked as completed
      if (!application.completedForms.includes("Non-Compete Agreement")) {
        application.completedForms.push("Non-Compete Agreement");
      }

      application.completionPercentage =
        application.calculateCompletionPercentage();
      await application.save();
    }

    const message =
      status === "draft"
        ? "Non-compete agreement saved as draft"
        : "Non-compete agreement completed";

    res.status(200).json({
      message,
      nonCompeteAgreement: nonCompeteForm,
      completionPercentage: application.completionPercentage,
    });
  } catch (error) {
    console.error("Error saving non-compete agreement:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// HR upload Non-Compete Agreement template
router.post("/hr-upload-non-compete-template", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    await NonCompeteTemplate.updateMany({}, { isActive: false });
    const template = new NonCompeteTemplate({
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

router.get("/get-non-compete-template", async (req, res) => {
  try {
    const template = await NonCompeteTemplate.findOne({ isActive: true }).sort({ createdAt: -1 });
    if (!template) return res.status(404).json({ message: "No template found" });
    res.status(200).json({ message: "Template retrieved successfully", template });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

router.post("/employee-upload-signed-non-compete", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const { applicationId, employeeId } = req.body;
    if (!applicationId) return res.status(400).json({ message: "Application ID is required" });
    let nonCompete = await NonCompeteAgreement.findOne({ applicationId });
    if (!nonCompete) nonCompete = new NonCompeteAgreement({ applicationId, employeeId });
    nonCompete.employeeUploadedForm = {
      filename: req.file.originalname,
      filePath: req.file.path,
      uploadedAt: new Date(),
    };
    nonCompete.status = "submitted";
    await nonCompete.save();
    res.status(200).json({ message: "Signed form uploaded successfully", nonCompete });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

router.get("/hr-get-all-non-compete-submissions", async (req, res) => {
  try {
    const submissions = await NonCompeteAgreement.find({ "employeeUploadedForm.filePath": { $exists: true, $ne: null } })
      .populate("employeeId", "firstName lastName email")
      .sort({ "employeeUploadedForm.uploadedAt": -1 });
    res.status(200).json({ message: "Submissions retrieved successfully", submissions });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get Non-Compete Agreement form
router.get("/get-non-compete-agreement/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;

    const nonCompeteAgreement = await NonCompeteAgreement.findOne({
      applicationId,
    });

    if (!nonCompeteAgreement) {
      return res
        .status(404)
        .json({ message: "Non-compete agreement not found" });
    }

    // Map database fields to frontend field names
    const mappedData = {
      ...nonCompeteAgreement.toObject(),
      // Map effective date back to frontend fields
      agreementDate:
        nonCompeteAgreement.effectiveDate?.day &&
        nonCompeteAgreement.effectiveDate?.month &&
        nonCompeteAgreement.effectiveDate?.year
          ? new Date(
              nonCompeteAgreement.effectiveDate.year,
              [
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].indexOf(nonCompeteAgreement.effectiveDate.month),
              nonCompeteAgreement.effectiveDate.day
            )
          : null,
      agreementMonth: nonCompeteAgreement.effectiveDate?.month || "",
      agreementYear: nonCompeteAgreement.effectiveDate?.year?.toString() || "",
      // Map employee info
      employeeName: nonCompeteAgreement.employeeInfo?.employeeName || "",
      employeeAddress: nonCompeteAgreement.employeeInfo?.address || "",
      jobTitle: nonCompeteAgreement.employeeInfo?.position || "",
      // Map company representative
      companyRepName: nonCompeteAgreement.companyRepresentative?.name || "",
      companyRepSignature:
        nonCompeteAgreement.companyRepresentative?.signature || "",
    };

    res.status(200).json({
      message: "Non-compete agreement retrieved successfully",
      nonCompeteAgreement: mappedData,
    });
  } catch (error) {
    console.error("Error getting non-compete agreement:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// HR clear Code of Ethics submission
router.delete("/hr-clear-code-of-ethics-submission/:id", async (req, res) => {
  try {
    await CodeOfEthics.findByIdAndUpdate(req.params.id, {
      $unset: { employeeUploadedForm: "" },
      status: "draft"
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// HR clear Service Delivery Policy submission
router.delete("/hr-clear-service-delivery-policy-submission/:id", async (req, res) => {
  try {
    await ServiceDeliveryPolicy.findByIdAndUpdate(req.params.id, {
      $unset: { employeeUploadedForm: "" },
      status: "draft"
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// HR clear Non-Compete Agreement submission
router.delete("/hr-clear-non-compete-submission/:id", async (req, res) => {
  try {
    const result = await NonCompeteAgreement.findByIdAndUpdate(req.params.id, {
      $unset: { employeeUploadedForm: "" },
      status: "draft"
    });
    if (!result) {
      return res.status(404).json({ message: "Form not found" });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// HR clear Background Check submission
router.delete("/hr-clear-background-check-submission/:id", async (req, res) => {
  try {
    const BackgroundCheck = require("../../database/Models/BackgroundCheck");
    const result = await BackgroundCheck.findByIdAndUpdate(req.params.id, {
      $unset: { employeeUploadedForm: "" },
      status: "draft"
    });
    if (!result) {
      return res.status(404).json({ message: "Form not found" });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============ EMPLOYMENT APPLICATION TEMPLATE ROUTES ============
router.post("/hr-upload-employment-application-template", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const EmploymentApplicationTemplate = require("../../database/Models/EmploymentApplicationTemplate");
    await EmploymentApplicationTemplate.updateMany({}, { isActive: false });
    const template = new EmploymentApplicationTemplate({
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

router.get("/get-employment-application-template", async (req, res) => {
  try {
    const EmploymentApplicationTemplate = require("../../database/Models/EmploymentApplicationTemplate");
    const template = await EmploymentApplicationTemplate.findOne({ isActive: true }).sort({ createdAt: -1 });
    if (!template) return res.status(404).json({ message: "No template found" });
    res.status(200).json({ message: "Template retrieved successfully", template });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// ============ I-9 FORM TEMPLATE ROUTES ============
router.post("/hr-upload-i9-form-template", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    await I9FormTemplate.updateMany({}, { isActive: false });
    const template = new I9FormTemplate({
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

router.get("/get-i9-form-template", async (req, res) => {
  try {
    const template = await I9FormTemplate.findOne({ isActive: true }).sort({ createdAt: -1 });
    if (!template) return res.status(404).json({ message: "No template found" });
    res.status(200).json({ message: "Template retrieved successfully", template });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// ============ W-4 FORM TEMPLATE ROUTES ============
router.post("/hr-upload-w4-form-template", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    await W4FormTemplate.updateMany({}, { isActive: false });
    const template = new W4FormTemplate({
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

router.get("/get-w4-form-template", async (req, res) => {
  try {
    const template = await W4FormTemplate.findOne({ isActive: true }).sort({ createdAt: -1 });
    if (!template) return res.status(404).json({ message: "No template found" });
    res.status(200).json({ message: "Template retrieved successfully", template });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// ============ W-9 FORM TEMPLATE ROUTES ============
router.post("/hr-upload-w9-form-template", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    await W9FormTemplate.updateMany({}, { isActive: false });
    const template = new W9FormTemplate({
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

router.get("/get-w9-form-template", async (req, res) => {
  try {
    const template = await W9FormTemplate.findOne({ isActive: true }).sort({ createdAt: -1 });
    if (!template) return res.status(404).json({ message: "No template found" });
    res.status(200).json({ message: "Template retrieved successfully", template });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// ============ RN JOB DESCRIPTION TEMPLATE ROUTES ============
router.post("/hr-upload-rn-job-description-template", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    await RNJobDescriptionTemplate.updateMany({}, { isActive: false });
    const template = new RNJobDescriptionTemplate({
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

router.get("/get-rn-job-description-template", async (req, res) => {
  try {
    const template = await RNJobDescriptionTemplate.findOne({ isActive: true }).sort({ createdAt: -1 });
    if (!template) return res.status(404).json({ message: "No template found" });
    res.status(200).json({ message: "Template retrieved successfully", template });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// ============ LPN JOB DESCRIPTION TEMPLATE ROUTES ============
router.post("/hr-upload-lpn-job-description-template", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    await LPNJobDescriptionTemplate.updateMany({}, { isActive: false });
    const template = new LPNJobDescriptionTemplate({
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

router.get("/get-lpn-job-description-template", async (req, res) => {
  try {
    const template = await LPNJobDescriptionTemplate.findOne({ isActive: true }).sort({ createdAt: -1 });
    if (!template) return res.status(404).json({ message: "No template found" });
    res.status(200).json({ message: "Template retrieved successfully", template });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// ============ CNA JOB DESCRIPTION TEMPLATE ROUTES ============
router.post("/hr-upload-cna-job-description-template", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    await CNAJobDescriptionTemplate.updateMany({}, { isActive: false });
    const template = new CNAJobDescriptionTemplate({
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

router.get("/get-cna-job-description-template", async (req, res) => {
  try {
    const template = await CNAJobDescriptionTemplate.findOne({ isActive: true }).sort({ createdAt: -1 });
    if (!template) return res.status(404).json({ message: "No template found" });
    res.status(200).json({ message: "Template retrieved successfully", template });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// ============ PCA JOB DESCRIPTION TEMPLATE ROUTES ============
router.post("/hr-upload-pca-job-description-template", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    await PCAJobDescriptionTemplate.updateMany({}, { isActive: false });
    const template = new PCAJobDescriptionTemplate({
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

router.get("/get-pca-job-description-template", async (req, res) => {
  try {
    const template = await PCAJobDescriptionTemplate.findOne({ isActive: true }).sort({ createdAt: -1 });
    if (!template) return res.status(404).json({ message: "No template found" });
    res.status(200).json({ message: "Template retrieved successfully", template });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

module.exports = router;
