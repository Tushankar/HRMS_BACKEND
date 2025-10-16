const express = require("express");
const EmergencyContact = require("../../database/Models/EmergencyContact");
const DirectDeposit = require("../../database/Models/DirectDeposit");
const BackgroundCheck = require("../../database/Models/BackgroundCheck");
const PersonalInformation = require("../../database/Models/PersonalInformation");
const ProfessionalExperience = require("../../database/Models/ProfessionalExperience");
const WorkExperience = require("../../database/Models/WorkExperience");
const OnboardingApplication = require("../../database/Models/OnboardingApplication");

const router = express.Router();

// Save or update Emergency Contact form
router.post("/save-emergency-contact", async (req, res) => {
  try {
    const { applicationId, employeeId, formData, status = "draft" } = req.body;

    // Debug logging
    console.log("Emergency Contact Save Request:");
    console.log("- applicationId:", applicationId);
    console.log("- employeeId:", employeeId);
    console.log("- status parameter:", status);
    console.log("- formData keys:", Object.keys(formData));
    if (formData.status) {
      console.log("- WARNING: formData contains status field:", formData.status);
    }

    if (!applicationId || !employeeId) {
      return res.status(400).json({ message: "Application ID and Employee ID are required" });
    }

    // Check if application exists
    const application = await OnboardingApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Onboarding application not found" });
    }

    // Find existing form or create new one
    let emergencyContactForm = await EmergencyContact.findOne({ applicationId });
    
    if (emergencyContactForm) {
      // Update existing form - ensure status parameter overrides any status in formData
      const { status: formDataStatus, ...cleanFormData } = formData;
      Object.assign(emergencyContactForm, cleanFormData);
      emergencyContactForm.status = status;
    } else {
      // Create new form - ensure status parameter overrides any status in formData
      const { status: formDataStatus, ...cleanFormData } = formData;
      emergencyContactForm = new EmergencyContact({
        applicationId,
        employeeId,
        ...cleanFormData,
        status
      });
    }

    await emergencyContactForm.save();

    // Update application progress
    if (status === "submitted" || status === "completed") {
      // Ensure completedForms array exists
      if (!application.completedForms) {
        application.completedForms = [];
      }
      
      // Check if Emergency Contact is already marked as completed
      if (!application.completedForms.includes("emergencyContact")) {
        application.completedForms.push("emergencyContact");
      }
      
      application.completionPercentage = application.calculateCompletionPercentage();
      await application.save();
    }

    const message = status === "draft" ? "Emergency contact form saved as draft" : "Emergency contact form submitted successfully";

    res.status(200).json({
      message,
      emergencyContact: emergencyContactForm,
      completionPercentage: application.completionPercentage
    });

  } catch (error) {
    console.error("Error saving emergency contact form:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get Emergency Contact form
router.get("/get-emergency-contact/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;

    const emergencyContact = await EmergencyContact.findOne({ applicationId });
    
    if (!emergencyContact) {
      return res.status(404).json({ message: "Emergency contact form not found" });
    }

    res.status(200).json({
      message: "Emergency contact form retrieved successfully",
      emergencyContact
    });

  } catch (error) {
    console.error("Error getting emergency contact form:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Save or update Direct Deposit form
router.post("/save-direct-deposit", async (req, res) => {
  try {
    const { applicationId, employeeId, formData, status = "draft" } = req.body;

    if (!applicationId || !employeeId) {
      return res.status(400).json({ message: "Application ID and Employee ID are required" });
    }

    // Check if application exists
    const application = await OnboardingApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Onboarding application not found" });
    }

    // Find existing form or create new one
    let directDepositForm = await DirectDeposit.findOne({ applicationId });
    
    if (directDepositForm) {
      // Update existing form - ensure status parameter overrides any status in formData
      const { status: formDataStatus, ...cleanFormData } = formData;
      Object.assign(directDepositForm, cleanFormData);
      directDepositForm.status = status;
    } else {
      // Create new form - ensure status parameter overrides any status in formData
      const { status: formDataStatus, ...cleanFormData } = formData;
      directDepositForm = new DirectDeposit({
        applicationId,
        employeeId,
        ...cleanFormData,
        status
      });
    }

    await directDepositForm.save();

    // Update application progress
    if (status === "submitted" || status === "completed") {
      // Ensure completedForms array exists
      if (!application.completedForms) {
        application.completedForms = [];
      }
      
      // Check if Direct Deposit is already marked as completed
      if (!application.completedForms.includes("directDeposit")) {
        application.completedForms.push("directDeposit");
      }
      
      application.completionPercentage = application.calculateCompletionPercentage();
      await application.save();
    }

    const message = status === "draft" ? "Direct deposit form saved as draft" : "Direct deposit form submitted successfully";

    res.status(200).json({
      message,
      directDeposit: directDepositForm,
      completionPercentage: application.completionPercentage
    });

  } catch (error) {
    console.error("Error saving direct deposit form:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get Direct Deposit form
router.get("/get-direct-deposit/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;

    const directDeposit = await DirectDeposit.findOne({ applicationId });
    
    if (!directDeposit) {
      return res.status(404).json({ message: "Direct deposit form not found" });
    }

    res.status(200).json({
      message: "Direct deposit form retrieved successfully",
      directDeposit
    });

  } catch (error) {
    console.error("Error getting direct deposit form:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get Direct Deposit form by ID
router.get("/get-direct-deposit-by-id/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const directDeposit = await DirectDeposit.findById(id);
    
    if (!directDeposit) {
      return res.status(404).json({ message: "Direct deposit form not found" });
    }

    res.status(200).json({
      message: "Direct deposit form retrieved successfully",
      directDeposit
    });

  } catch (error) {
    console.error("Error getting direct deposit form by ID:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get Emergency Contact form by ID
router.get("/get-emergency-contact/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const emergencyContact = await EmergencyContact.findById(id);
    
    if (!emergencyContact) {
      return res.status(404).json({ message: "Emergency contact form not found" });
    }

    res.status(200).json({
      message: "Emergency contact form retrieved successfully",
      emergencyContact
    });

  } catch (error) {
    console.error("Error getting emergency contact form by ID:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Save or update Background Check form
router.post("/save-background-check", async (req, res) => {
  try {
    const { applicationId, employeeId, formData, status = "draft" } = req.body;

    if (!applicationId || !employeeId) {
      return res.status(400).json({ message: "Application ID and Employee ID are required" });
    }

    // Check if application exists
    const application = await OnboardingApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Onboarding application not found" });
    }

    // Validate formData structure
    if (!formData) {
      return res.status(400).json({ message: "Form data is required" });
    }

    // Find existing form or create new one
    let backgroundCheckForm = await BackgroundCheck.findOne({ applicationId });
    
    if (backgroundCheckForm) {
      // Update existing form
      backgroundCheckForm.applicantInfo = {
        lastName: formData.lastName,
        firstName: formData.firstName,
        middleInitial: formData.middleInitial,
        socialSecurityNumber: formData.socialSecurityNo,
        dateOfBirth: formData.dateOfBirth,
        height: formData.height,
        weight: formData.weight,
        sex: formData.sex,
        eyeColor: formData.eyeColor,
        hairColor: formData.hairColor,
        race: formData.race,
        address: {
          street: formData.streetAddress,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zip,
        },
      };
      backgroundCheckForm.employmentInfo = {
        provider: formData.provider,
        positionAppliedFor: formData.positionAppliedFor,
      };
      backgroundCheckForm.applicantSignature = formData.signature;
      backgroundCheckForm.applicantSignatureDate = formData.date;
      backgroundCheckForm.status = status;
    } else {
      // Create new form
      backgroundCheckForm = new BackgroundCheck({
        applicationId,
        employeeId,
        applicantInfo: {
          lastName: formData.lastName,
          firstName: formData.firstName,
          middleInitial: formData.middleInitial,
          socialSecurityNumber: formData.socialSecurityNo,
          dateOfBirth: formData.dateOfBirth,
          height: formData.height,
          weight: formData.weight,
          sex: formData.sex,
          eyeColor: formData.eyeColor,
          hairColor: formData.hairColor,
          race: formData.race,
          address: {
            street: formData.streetAddress,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zip,
          },
        },
        employmentInfo: {
          provider: formData.provider,
          positionAppliedFor: formData.positionAppliedFor,
        },
        applicantSignature: formData.signature,
        applicantSignatureDate: formData.date,
        status
      });
    }

    await backgroundCheckForm.save();

    // Update application progress
    if (status === "completed") {
      // Ensure completedForms array exists
      if (!application.completedForms) {
        application.completedForms = [];
      }
      
      // Check if Background Check is already marked as completed
      if (!application.completedForms.includes("Background Check")) {
        application.completedForms.push("Background Check");
        await application.save();
      }
    }

    res.status(200).json({
      message: "Background check form saved successfully",
      backgroundCheck: backgroundCheckForm
    });

  } catch (error) {
    console.error("Error saving background check form:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get Background Check form by ID
router.get("/get-background-check-by-id/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const backgroundCheck = await BackgroundCheck.findById(id);
    
    if (!backgroundCheck) {
      return res.status(404).json({ message: "Background check form not found" });
    }

    // Transform the data to match frontend format
    const formData = {
      lastName: backgroundCheck.applicantInfo?.lastName || "",
      firstName: backgroundCheck.applicantInfo?.firstName || "",
      middleInitial: backgroundCheck.applicantInfo?.middleInitial || "",
      socialSecurityNo: backgroundCheck.applicantInfo?.socialSecurityNumber || "",
      height: backgroundCheck.applicantInfo?.height || "",
      weight: backgroundCheck.applicantInfo?.weight || "",
      eyeColor: backgroundCheck.applicantInfo?.eyeColor || "",
      hairColor: backgroundCheck.applicantInfo?.hairColor || "",
      dateOfBirth: backgroundCheck.applicantInfo?.dateOfBirth || new Date(),
      sex: backgroundCheck.applicantInfo?.sex || "",
      race: backgroundCheck.applicantInfo?.race || "",
      streetAddress: backgroundCheck.applicantInfo?.address?.street || "",
      city: backgroundCheck.applicantInfo?.address?.city || "",
      state: backgroundCheck.applicantInfo?.address?.state || "",
      zip: backgroundCheck.applicantInfo?.address?.zipCode || "",
      provider: backgroundCheck.employmentInfo?.provider || "",
      positionAppliedFor: backgroundCheck.employmentInfo?.positionAppliedFor || "",
      signature: backgroundCheck.applicantSignature || "",
      date: backgroundCheck.applicantSignatureDate || new Date(),
    };

    res.status(200).json({
      message: "Background check form retrieved successfully",
      backgroundCheck: {
        ...backgroundCheck.toObject(),
        formData
      }
    });

  } catch (error) {
    console.error("Error getting background check form by ID:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Save or update Personal Information form
router.post("/save-personal-information", async (req, res) => {
  try {
    const { applicationId, employeeId, formData, status = "draft" } = req.body;

    if (!applicationId || !employeeId) {
      return res.status(400).json({ message: "Application ID and Employee ID are required" });
    }

    // Check if application exists
    const application = await OnboardingApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Onboarding application not found" });
    }

    // Find existing form or create new one
    let personalInfoForm = await PersonalInformation.findOne({ applicationId });
    
    if (personalInfoForm) {
      // Update existing form - ensure status parameter overrides any status in formData
      const { status: formDataStatus, ...cleanFormData } = formData;
      Object.assign(personalInfoForm, cleanFormData);
      personalInfoForm.status = status;
    } else {
      // Create new form - ensure status parameter overrides any status in formData
      const { status: formDataStatus, ...cleanFormData } = formData;
      personalInfoForm = new PersonalInformation({
        applicationId,
        employeeId,
        ...cleanFormData,
        status
      });
    }

    // Use validateBeforeSave: false for draft to skip validation
    await personalInfoForm.save({ validateBeforeSave: status !== "draft" });

    // Update application progress
    if (status === "completed") {
      // Ensure completedForms array exists
      if (!application.completedForms) {
        application.completedForms = [];
      }
      
      // Check if Personal Information is already marked as completed
      if (!application.completedForms.includes("Personal Information")) {
        application.completedForms.push("Personal Information");
      }
      
      application.completionPercentage = application.calculateCompletionPercentage();
      await application.save();
    }

    const message = status === "draft" ? "Personal information saved as draft" : "Personal information completed";

    res.status(200).json({
      message,
      personalInformation: personalInfoForm,
      completionPercentage: application.completionPercentage
    });

  } catch (error) {
    console.error("Error saving personal information form:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get Personal Information form
router.get("/get-personal-information/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;

    const personalInformation = await PersonalInformation.findOne({ applicationId });
    
    if (!personalInformation) {
      return res.status(404).json({ message: "Personal information form not found" });
    }

    res.status(200).json({
      message: "Personal information form retrieved successfully",
      personalInformation
    });

  } catch (error) {
    console.error("Error getting personal information form:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get Personal Information form by ID
router.get("/get-personal-information-by-id/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const personalInformation = await PersonalInformation.findById(id);
    
    if (!personalInformation) {
      return res.status(404).json({ message: "Personal information form not found" });
    }

    res.status(200).json({
      message: "Personal information form retrieved successfully",
      personalInformation
    });

  } catch (error) {
    console.error("Error getting personal information form by ID:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Save or update Professional Experience form
router.post("/save-professional-experience", async (req, res) => {
  try {
    const { applicationId, employeeId, formData, status = "draft" } = req.body;

    if (!applicationId || !employeeId) {
      return res.status(400).json({ message: "Application ID and Employee ID are required" });
    }

    // Check if application exists
    const application = await OnboardingApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Onboarding application not found" });
    }

    // Find existing form or create new one
    let professionalExpForm = await ProfessionalExperience.findOne({ applicationId });
    
    if (professionalExpForm) {
      // Update existing form - ensure status parameter overrides any status in formData
      const { status: formDataStatus, ...cleanFormData } = formData;
      Object.assign(professionalExpForm, cleanFormData);
      professionalExpForm.status = status;
    } else {
      // Create new form - ensure status parameter overrides any status in formData
      const { status: formDataStatus, ...cleanFormData } = formData;
      professionalExpForm = new ProfessionalExperience({
        applicationId,
        employeeId,
        ...cleanFormData,
        status
      });
    }

    // Use validateBeforeSave: false for draft to skip validation
    await professionalExpForm.save({ validateBeforeSave: status !== "draft" });

    // Update application progress
    if (status === "completed") {
      // Ensure completedForms array exists
      if (!application.completedForms) {
        application.completedForms = [];
      }
      
      // Check if Professional Experience is already marked as completed
      if (!application.completedForms.includes("Professional Experience")) {
        application.completedForms.push("Professional Experience");
      }
      
      application.completionPercentage = application.calculateCompletionPercentage();
      await application.save();
    }

    const message = status === "draft" ? "Professional experience saved as draft" : "Professional experience completed";

    res.status(200).json({
      message,
      professionalExperience: professionalExpForm,
      completionPercentage: application.completionPercentage
    });

  } catch (error) {
    console.error("Error saving professional experience form:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get Professional Experience form
router.get("/get-professional-experience/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;

    const professionalExperience = await ProfessionalExperience.findOne({ applicationId });
    
    if (!professionalExperience) {
      return res.status(404).json({ message: "Professional experience form not found" });
    }

    res.status(200).json({
      message: "Professional experience form retrieved successfully",
      professionalExperience
    });

  } catch (error) {
    console.error("Error getting professional experience form:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get Professional Experience form by ID
router.get("/get-professional-experience-by-id/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const professionalExperience = await ProfessionalExperience.findById(id);
    
    if (!professionalExperience) {
      return res.status(404).json({ message: "Professional experience form not found" });
    }

    res.status(200).json({
      message: "Professional experience form retrieved successfully",
      professionalExperience
    });

  } catch (error) {
    console.error("Error getting professional experience form by ID:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Save or update Work Experience form
router.post("/save-work-experience", async (req, res) => {
  try {
    const { applicationId, employeeId, formData, status = "draft" } = req.body;

    if (!applicationId || !employeeId) {
      return res.status(400).json({ message: "Application ID and Employee ID are required" });
    }

    // Check if application exists
    const application = await OnboardingApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Onboarding application not found" });
    }

    // Find existing form or create new one
    let workExperienceForm = await WorkExperience.findOne({ applicationId });
    
    if (workExperienceForm) {
      // Update existing form - ensure status parameter overrides any status in formData
      const { status: formDataStatus, ...cleanFormData } = formData;
      Object.assign(workExperienceForm, cleanFormData);
      workExperienceForm.status = status;
    } else {
      // Create new form - ensure status parameter overrides any status in formData
      const { status: formDataStatus, ...cleanFormData } = formData;
      workExperienceForm = new WorkExperience({
        applicationId,
        employeeId,
        ...cleanFormData,
        status
      });
    }

    await workExperienceForm.save();

    // Update application progress
    if (status === "completed") {
      // Ensure completedForms array exists
      if (!application.completedForms) {
        application.completedForms = [];
      }
      
      // Check if Work Experience is already marked as completed
      if (!application.completedForms.includes("Work Experience")) {
        application.completedForms.push("Work Experience");
      }
      
      application.completionPercentage = application.calculateCompletionPercentage();
      await application.save();
    }

    const message = status === "draft" ? "Work experience saved as draft" : "Work experience completed";

    res.status(200).json({
      message,
      workExperience: workExperienceForm,
      completionPercentage: application.completionPercentage
    });

  } catch (error) {
    console.error("Error saving work experience form:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get Work Experience form
router.get("/get-work-experience/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;

    const workExperience = await WorkExperience.findOne({ applicationId });
    
    if (!workExperience) {
      return res.status(404).json({ message: "Work experience form not found" });
    }

    res.status(200).json({
      message: "Work experience form retrieved successfully",
      workExperience
    });

  } catch (error) {
    console.error("Error getting work experience form:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get Work Experience form by ID
router.get("/get-work-experience-by-id/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const workExperience = await WorkExperience.findById(id);
    
    if (!workExperience) {
      return res.status(404).json({ message: "Work experience form not found" });
    }

    res.status(200).json({
      message: "Work experience form retrieved successfully",
      workExperience
    });

  } catch (error) {
    console.error("Error getting work experience form by ID:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

module.exports = router;
