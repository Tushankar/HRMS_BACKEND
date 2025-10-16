const express = require("express");
const I9Form = require("../../database/Models/I9Form");
const OnboardingApplication = require("../../database/Models/OnboardingApplication");

const router = express.Router();

// Helper function to map frontend citizenship status to schema enum values
function mapCitizenshipStatus(status) {
  const mapping = {
    'citizen': 'us_citizen',
    'national': 'non_citizen_national',
    'alien': 'lawful_permanent_resident',
    'authorized': 'authorized_alien'
  };
  return mapping[status] || status;
}

// Helper function to map schema enum values back to frontend format
function mapCitizenshipStatusToFrontend(status) {
  const mapping = {
    'us_citizen': 'citizen',
    'non_citizen_national': 'national',
    'lawful_permanent_resident': 'alien',
    'authorized_alien': 'authorized'
  };
  return mapping[status] || status;
}

// Save or update I-9 form
router.post("/save-i9-form", async (req, res) => {
  try {
    const { applicationId, employeeId, formData, status = "draft", hrFeedback } = req.body;

    console.log("I9 Form Save Request:");
    console.log("- ApplicationID:", applicationId);
    console.log("- EmployeeID:", employeeId);
    console.log("- Status:", status);
    console.log("- FormData:", formData ? "Present" : "undefined");
    console.log("- HRFeedback:", hrFeedback ? "Present" : "undefined");

    if (!applicationId || !employeeId) {
      return res.status(400).json({ message: "Application ID and Employee ID are required" });
    }

    // Check if application exists
    const application = await OnboardingApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Onboarding application not found" });
    }

    // Find existing form or create new one
    let i9Form = await I9Form.findOne({ applicationId });
    
    // If only HR feedback is being updated (no formData)
    if (!formData && hrFeedback) {
      if (!i9Form) {
        i9Form = new I9Form({ applicationId, employeeId, status });
      }
      i9Form.hrFeedback = hrFeedback;
      i9Form.status = status;
      await i9Form.save();
      return res.status(200).json({ success: true, i9Form, message: "HR feedback saved successfully" });
    }
    
    if (i9Form) {
      // Update existing form - handle both nested and flat structures
      if (formData && (formData.section1 || formData.section2)) {
        // Nested structure from EditI9Form - apply citizenship status mapping
        if (formData.section1) {
          const mappedSection1 = { ...formData.section1 };
          if (mappedSection1.citizenshipStatus) {
            mappedSection1.citizenshipStatus = mapCitizenshipStatus(mappedSection1.citizenshipStatus);
          }
          i9Form.section1 = { ...i9Form.section1, ...mappedSection1 };
        }
        if (formData.section2) {
          i9Form.section2 = { ...i9Form.section2, ...formData.section2 };
        }
      } else {
        // Flat structure - map to nested structure with citizenship status mapping
        i9Form.section1 = {
          lastName: formData.lastName || i9Form.section1?.lastName,
          firstName: formData.firstName || i9Form.section1?.firstName,
          middleInitial: formData.middleInitial || i9Form.section1?.middleInitial,
          otherLastNames: formData.otherLastNames || i9Form.section1?.otherLastNames,
          address: formData.address || i9Form.section1?.address,
          aptNumber: formData.aptNumber || i9Form.section1?.aptNumber,
          cityOrTown: formData.cityOrTown || i9Form.section1?.cityOrTown,
          state: formData.state || i9Form.section1?.state,
          zipCode: formData.zipCode || i9Form.section1?.zipCode,
          dateOfBirth: formData.dateOfBirth || i9Form.section1?.dateOfBirth,
          socialSecurityNumber: formData.socialSecurityNumber || i9Form.section1?.socialSecurityNumber,
          employeeEmail: formData.employeeEmail || i9Form.section1?.employeeEmail,
          employeePhone: formData.employeePhone || i9Form.section1?.employeePhone,
          citizenshipStatus: mapCitizenshipStatus(formData.citizenshipStatus) || i9Form.section1?.citizenshipStatus,
          uscisNumber: formData.uscisNumber || i9Form.section1?.uscisNumber,
          formI94Number: formData.formI94Number || i9Form.section1?.formI94Number,
          foreignPassportNumber: formData.foreignPassportNumber || i9Form.section1?.foreignPassportNumber,
          countryOfIssuance: formData.countryOfIssuance || i9Form.section1?.countryOfIssuance,
          expirationDate: formData.expirationDate || i9Form.section1?.expirationDate,
          employeeSignature: formData.employeeSignature || i9Form.section1?.employeeSignature,
          employeeSignatureDate: formData.employeeSignatureDate || i9Form.section1?.employeeSignatureDate,
          preparerTranslator: {
            preparerUsed: formData.preparerUsed !== undefined ? formData.preparerUsed : i9Form.section1?.preparerTranslator?.preparerUsed,
            preparerLastName: formData.preparerLastName || i9Form.section1?.preparerTranslator?.preparerLastName,
            preparerFirstName: formData.preparerFirstName || i9Form.section1?.preparerTranslator?.preparerFirstName,
            preparerAddress: formData.preparerAddress || i9Form.section1?.preparerTranslator?.preparerAddress,
            preparerSignature: formData.preparerSignature || i9Form.section1?.preparerTranslator?.preparerSignature,
            preparerDate: formData.preparerDate || i9Form.section1?.preparerTranslator?.preparerDate,
          }
        };

        i9Form.section2 = {
          employmentStartDate: formData.employmentStartDate || i9Form.section2?.employmentStartDate,
          documentTitle1: formData.documentTitle1 || i9Form.section2?.documentTitle1,
          issuingAuthority1: formData.issuingAuthority1 || i9Form.section2?.issuingAuthority1,
          documentNumber1: formData.documentNumber1 || i9Form.section2?.documentNumber1,
          expirationDate1: formData.expirationDate1 || i9Form.section2?.expirationDate1,
          documentTitle2: formData.documentTitle2 || i9Form.section2?.documentTitle2,
          issuingAuthority2: formData.issuingAuthority2 || i9Form.section2?.issuingAuthority2,
          documentNumber2: formData.documentNumber2 || i9Form.section2?.documentNumber2,
          expirationDate2: formData.expirationDate2 || i9Form.section2?.expirationDate2,
          documentTitle3: formData.documentTitle3 || i9Form.section2?.documentTitle3,
          issuingAuthority3: formData.issuingAuthority3 || i9Form.section2?.issuingAuthority3,
          documentNumber3: formData.documentNumber3 || i9Form.section2?.documentNumber3,
          expirationDate3: formData.expirationDate3 || i9Form.section2?.expirationDate3,
          additionalInfo: formData.additionalInfo || i9Form.section2?.additionalInfo,
          employerSignature: formData.employerSignature || i9Form.section2?.employerSignature,
          employerSignatureDate: formData.employerSignatureDate || i9Form.section2?.employerSignatureDate,
          employerName: formData.employerName || i9Form.section2?.employerName,
          employerTitle: formData.employerTitle || i9Form.section2?.employerTitle,
          employerBusinessName: formData.employerBusinessName || i9Form.section2?.employerBusinessName,
          employerBusinessAddress: formData.employerBusinessAddress || i9Form.section2?.employerBusinessAddress,
        };
      }
      
      i9Form.status = status;
    } else {
      // Create new form
      const newFormData = {
        applicationId,
        employeeId,
        status
      };

      // Handle both nested and flat structures
      if (formData.section1 || formData.section2) {
        // Nested structure - apply citizenship status mapping
        if (formData.section1) {
          const mappedSection1 = { ...formData.section1 };
          if (mappedSection1.citizenshipStatus) {
            mappedSection1.citizenshipStatus = mapCitizenshipStatus(mappedSection1.citizenshipStatus);
          }
          newFormData.section1 = mappedSection1;
        } else {
          newFormData.section1 = {};
        }
        newFormData.section2 = formData.section2 || {};
      } else {
        // Flat structure - map to nested with citizenship status mapping
        newFormData.section1 = {
          lastName: formData.lastName,
          firstName: formData.firstName,
          middleInitial: formData.middleInitial,
          otherLastNames: formData.otherLastNames,
          address: formData.address,
          aptNumber: formData.aptNumber,
          cityOrTown: formData.cityOrTown,
          state: formData.state,
          zipCode: formData.zipCode,
          dateOfBirth: formData.dateOfBirth,
          socialSecurityNumber: formData.socialSecurityNumber,
          employeeEmail: formData.employeeEmail,
          employeePhone: formData.employeePhone,
          citizenshipStatus: mapCitizenshipStatus(formData.citizenshipStatus),
          uscisNumber: formData.uscisNumber,
          formI94Number: formData.formI94Number,
          foreignPassportNumber: formData.foreignPassportNumber,
          countryOfIssuance: formData.countryOfIssuance,
          expirationDate: formData.expirationDate,
          employeeSignature: formData.employeeSignature,
          employeeSignatureDate: formData.employeeSignatureDate,
          preparerTranslator: {
            preparerUsed: formData.preparerUsed || false,
            preparerLastName: formData.preparerLastName,
            preparerFirstName: formData.preparerFirstName,
            preparerAddress: formData.preparerAddress,
            preparerSignature: formData.preparerSignature,
            preparerDate: formData.preparerDate,
          }
        };

        newFormData.section2 = {
          employmentStartDate: formData.employmentStartDate,
          documentTitle1: formData.documentTitle1,
          issuingAuthority1: formData.issuingAuthority1,
          documentNumber1: formData.documentNumber1,
          expirationDate1: formData.expirationDate1,
          documentTitle2: formData.documentTitle2,
          issuingAuthority2: formData.issuingAuthority2,
          documentNumber2: formData.documentNumber2,
          expirationDate2: formData.expirationDate2,
          documentTitle3: formData.documentTitle3,
          issuingAuthority3: formData.issuingAuthority3,
          documentNumber3: formData.documentNumber3,
          expirationDate3: formData.expirationDate3,
          additionalInfo: formData.additionalInfo,
          employerSignature: formData.employerSignature,
          employerSignatureDate: formData.employerSignatureDate,
          employerName: formData.employerName,
          employerTitle: formData.employerTitle,
          employerBusinessName: formData.employerBusinessName,
          employerBusinessAddress: formData.employerBusinessAddress,
        };
      }

      i9Form = new I9Form(newFormData);
    }

    await i9Form.save();

    // Update application progress
    if (status === "completed") {
      // Ensure completedForms array exists
      if (!application.completedForms) {
        application.completedForms = [];
      }
      
      // Check if I-9 Form is already marked as completed
      if (!application.completedForms.includes("I-9 Form")) {
        application.completedForms.push("I-9 Form");
      }
      
      application.completionPercentage = application.calculateCompletionPercentage();
      await application.save();
    }

    const message = status === "draft" ? "I-9 form saved as draft" : "I-9 form completed";

    res.status(200).json({
      message,
      i9Form: i9Form,
      completionPercentage: application.completionPercentage
    });

  } catch (error) {
    console.error("Error saving I-9 form:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get I-9 form by application ID
router.get("/get-i9-form/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;

    const i9Form = await I9Form.findOne({ applicationId });
    
    if (!i9Form) {
      return res.status(404).json({ message: "I-9 form not found" });
    }

    // Apply reverse mapping for frontend compatibility
    const frontendI9Form = i9Form.toObject();
    if (frontendI9Form.section1?.citizenshipStatus) {
      frontendI9Form.section1.citizenshipStatus = mapCitizenshipStatusToFrontend(frontendI9Form.section1.citizenshipStatus);
    }

    res.status(200).json({
      message: "I-9 form retrieved successfully",
      i9Form: frontendI9Form
    });

  } catch (error) {
    console.error("Error getting I-9 form:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get I-9 form by form ID (for direct editing)
router.get("/get-i9-form-by-id/:formId", async (req, res) => {
  try {
    const { formId } = req.params;

    const i9Form = await I9Form.findById(formId);
    
    if (!i9Form) {
      return res.status(404).json({ message: "I-9 form not found" });
    }

    // Apply reverse mapping for frontend compatibility
    const frontendI9Form = i9Form.toObject();
    if (frontendI9Form.section1?.citizenshipStatus) {
      frontendI9Form.section1.citizenshipStatus = mapCitizenshipStatusToFrontend(frontendI9Form.section1.citizenshipStatus);
    }

    res.status(200).json({
      message: "I-9 form retrieved successfully",
      i9Form: frontendI9Form
    });

  } catch (error) {
    console.error("Error getting I-9 form:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

module.exports = router;
