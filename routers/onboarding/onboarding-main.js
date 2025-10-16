const express = require("express");
const mongoose = require("mongoose");
const OnboardingApplication = require("../../database/Models/OnboardingApplication");
const EmploymentApplication = require("../../database/Models/EmploymentApplication");
const I9Form = require("../../database/Models/I9Form");
const W4Form = require("../../database/Models/W4Form");
const W9Form = require("../../database/Models/W9Form");
const PersonalInformation = require("../../database/Models/PersonalInformation");
const ProfessionalExperience = require("../../database/Models/ProfessionalExperience");
const EmergencyContact = require("../../database/Models/EmergencyContact");
const DirectDeposit = require("../../database/Models/DirectDeposit");
const MisconductStatement = require("../../database/Models/MisconductStatement");
const CodeOfEthics = require("../../database/Models/CodeOfEthics");
const ServiceDeliveryPolicy = require("../../database/Models/ServiceDeliveryPolicy");
const NonCompeteAgreement = require("../../database/Models/NonCompeteAgreement");
const BackgroundCheck = require("../../database/Models/BackgroundCheck");
const TBSymptomScreen = require("../../database/Models/TBSymptomScreen");
const OrientationChecklist = require("../../database/Models/OrientationChecklist");
const JobDescriptionAcknowledgment = require("../../database/Models/JobDescriptionAcknowledgment");
const PCAJobDescription = require("../../database/Models/PCAJobDescription");
const CNAJobDescription = require("../../database/Models/CNAJobDescription");
const LPNJobDescription = require("../../database/Models/LPNJobDescription");
const RNJobDescription = require("../../database/Models/RNJobDescription");
const PCATrainingQuestions = require("../../database/Models/PCATrainingQuestions");
const WorkExperience = require("../../database/Models/WorkExperience");
const Education = require("../../database/Models/Education");
const References = require("../../database/Models/References");
const LegalDisclosures = require("../../database/Models/LegalDisclosures");
const PositionType = require("../../database/Models/PositionType");
const OrientationPresentation = require("../../database/Models/OrientationPresentation");
const User = require("../../database/Models/Users");
const { isFormEditable } = require("../../utils/formUtils");
const { getFormKeysForPosition, getRelevantJobDescriptionForms } = require("../../utils/positionUtils");

const router = express.Router();

// Helper function to map schema enum values back to frontend format for W4
function mapFilingStatusToFrontend(status) {
  const mapping = {
    single_or_married_filing_separately: "single",
    married_filing_jointly_or_qualifying_surviving_spouse: "married",
    head_of_household: "headOfHousehold",
  };
  return mapping[status] || status;
}

// Helper function to map schema enum values back to frontend format for W9
function mapTaxClassificationToFrontend(classification) {
  const mapping = {
    individual_sole_proprietor: "individual",
    c_corporation: "c-corporation",
    s_corporation: "s-corporation",
    partnership: "partnership",
    trust_estate: "trust-estate",
    llc: "llc",
    other: "other",
  };
  return mapping[classification] || classification;
}

// Helper function to map schema enum values back to frontend format for I9
function mapCitizenshipStatusToFrontend(status) {
  const mapping = {
    us_citizen: "citizen",
    non_citizen_national: "national",
    lawful_permanent_resident: "alien",
    authorized_alien: "authorized",
  };
  return mapping[status] || status;
}

// Get or create onboarding application
router.get("/get-application/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Check if employee exists - handle both ObjectId and email
    let employee;
    try {
      // First try to find by ObjectId
      if (mongoose.Types.ObjectId.isValid(employeeId)) {
        employee = await User.findById(employeeId);
      }

      // If not found or not a valid ObjectId, try to find by email
      if (!employee) {
        employee = await User.findOne({ email: employeeId });
      }

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
    } catch (error) {
      console.error("Error finding employee:", error);
      return res
        .status(500)
        .json({ message: "Error finding employee", error: error.message });
    }

    // Use the actual employee ObjectId for the application lookup
    const actualEmployeeId = employee._id;

    // Find existing application or create new one
    let application = await OnboardingApplication.findOne({
      employeeId: actualEmployeeId,
    });

    if (!application) {
      application = new OnboardingApplication({
        employeeId: actualEmployeeId,
        applicationStatus: "draft",
        completionPercentage: 0,
        formsCompleted: [],
      });
      await application.save();
    }

    // Get all related forms
    const [
      personalInformation,
      professionalExperience,
      education,
      references,
      legalDisclosures,
      positionType,
      employmentApp,
      orientationPresentation,
      i9Form,
      w4Form,
      w9Form,
      emergencyContact,
      directDeposit,
      misconductStatement,
      codeOfEthics,
      serviceDeliveryPolicy,
      nonCompeteAgreement,
      backgroundCheck,
      tbSymptomScreen,
      orientationChecklist,
      workExperience,
      jobDescriptionPCA,
      jobDescriptionCNA,
      jobDescriptionLPN,
      jobDescriptionRN,
      pcaTrainingQuestions,
    ] = await Promise.all([
      PersonalInformation.findOne({ applicationId: application._id }),
      ProfessionalExperience.findOne({ applicationId: application._id }),
      Education.findOne({ applicationId: application._id }),
      References.findOne({ applicationId: application._id }),
      LegalDisclosures.findOne({ applicationId: application._id }),
      PositionType.findOne({ applicationId: application._id }),
      EmploymentApplication.findOne({ applicationId: application._id }),
      OrientationPresentation.findOne({ applicationId: application._id }),
      I9Form.findOne({ applicationId: application._id }),
      W4Form.findOne({ applicationId: application._id }),
      W9Form.findOne({ applicationId: application._id }),
      EmergencyContact.findOne({ applicationId: application._id }),
      DirectDeposit.findOne({ applicationId: application._id }),
      MisconductStatement.findOne({ applicationId: application._id }),
      CodeOfEthics.findOne({ applicationId: application._id }),
      ServiceDeliveryPolicy.findOne({ applicationId: application._id }),
      NonCompeteAgreement.findOne({ applicationId: application._id }),
      BackgroundCheck.findOne({ applicationId: application._id }),
      TBSymptomScreen.findOne({ applicationId: application._id }),
      OrientationChecklist.findOne({ applicationId: application._id }),
      WorkExperience.findOne({ applicationId: application._id }),
      PCAJobDescription.findOne({ applicationId: application._id }),
      CNAJobDescription.findOne({ applicationId: application._id }),
      LPNJobDescription.findOne({ applicationId: application._id }),
      RNJobDescription.findOne({ applicationId: application._id }),
      PCATrainingQuestions.findOne({ applicationId: application._id }),
    ]);

    // Create default job description forms if they don't exist
    let jobDescriptionPCACreated = jobDescriptionPCA;
    let jobDescriptionCNACreated = jobDescriptionCNA;
    let jobDescriptionLPNCreated = jobDescriptionLPN;
    let jobDescriptionRNCreated = jobDescriptionRN;
    let pcaTrainingQuestionsCreated = pcaTrainingQuestions;

    if (!jobDescriptionPCA) {
      jobDescriptionPCACreated = new PCAJobDescription({
        applicationId: application._id,
        employeeId: actualEmployeeId,
        status: "draft",
      });
      await jobDescriptionPCACreated.save();
    }

    if (!jobDescriptionCNA) {
      jobDescriptionCNACreated = new CNAJobDescription({
        applicationId: application._id,
        employeeId: actualEmployeeId,
        status: "draft",
      });
      await jobDescriptionCNACreated.save();
    }

    if (!jobDescriptionLPN) {
      jobDescriptionLPNCreated = new LPNJobDescription({
        applicationId: application._id,
        employeeId: actualEmployeeId,
        status: "draft",
      });
      await jobDescriptionLPNCreated.save();
    }

    if (!jobDescriptionRN) {
      jobDescriptionRNCreated = new RNJobDescription({
        applicationId: application._id,
        employeeId: actualEmployeeId,
        status: "draft",
      });
      await jobDescriptionRNCreated.save();
    }

    // Create PCA Training Questions if it doesn't exist
    if (!pcaTrainingQuestions) {
      pcaTrainingQuestionsCreated = new PCATrainingQuestions({
        applicationId: application._id,
        employeeId: actualEmployeeId,
        status: "pending",
      });
      await pcaTrainingQuestionsCreated.save();
    }

    // Transform I9 form from nested to flat structure for frontend compatibility
    let i9FormFlattened = null;
    if (i9Form) {
      i9FormFlattened = {
        _id: i9Form._id,
        applicationId: i9Form.applicationId,
        employeeId: i9Form.employeeId,
        // Section 1 fields (flattened from section1)
        lastName: i9Form.section1?.lastName || "",
        firstName: i9Form.section1?.firstName || "",
        middleInitial: i9Form.section1?.middleInitial || "",
        otherLastNames: i9Form.section1?.otherLastNames || "",
        address: i9Form.section1?.address || "",
        aptNumber: i9Form.section1?.aptNumber || "",
        cityOrTown: i9Form.section1?.cityOrTown || "",
        state: i9Form.section1?.state || "",
        zipCode: i9Form.section1?.zipCode || "",
        dateOfBirth: i9Form.section1?.dateOfBirth || "",
        socialSecurityNumber: i9Form.section1?.socialSecurityNumber || "",
        employeeEmail: i9Form.section1?.employeeEmail || "",
        employeePhone: i9Form.section1?.employeePhone || "",
        citizenshipStatus:
          mapCitizenshipStatusToFrontend(i9Form.section1?.citizenshipStatus) ||
          "",
        uscisNumber: i9Form.section1?.uscisNumber || "",
        formI94Number: i9Form.section1?.formI94Number || "",
        foreignPassportNumber: i9Form.section1?.foreignPassportNumber || "",
        countryOfIssuance: i9Form.section1?.countryOfIssuance || "",
        expirationDate: i9Form.section1?.expirationDate || "",
        employeeSignature: i9Form.section1?.employeeSignature || "",
        employeeSignatureDate: i9Form.section1?.employeeSignatureDate || "",
        // Preparer/Translator fields (flattened from section1.preparerTranslator)
        preparerUsed:
          i9Form.section1?.preparerTranslator?.preparerUsed || false,
        preparerLastName:
          i9Form.section1?.preparerTranslator?.preparerLastName || "",
        preparerFirstName:
          i9Form.section1?.preparerTranslator?.preparerFirstName || "",
        preparerAddress:
          i9Form.section1?.preparerTranslator?.preparerAddress || "",
        preparerSignature:
          i9Form.section1?.preparerTranslator?.preparerSignature || "",
        preparerDate: i9Form.section1?.preparerTranslator?.preparerDate || "",
        // Section 2 fields (flattened from section2)
        employmentStartDate: i9Form.section2?.employmentStartDate || "",
        documentTitle1: i9Form.section2?.documentTitle1 || "",
        issuingAuthority1: i9Form.section2?.issuingAuthority1 || "",
        documentNumber1: i9Form.section2?.documentNumber1 || "",
        expirationDate1: i9Form.section2?.expirationDate1 || "",
        documentTitle2: i9Form.section2?.documentTitle2 || "",
        issuingAuthority2: i9Form.section2?.issuingAuthority2 || "",
        documentNumber2: i9Form.section2?.documentNumber2 || "",
        expirationDate2: i9Form.section2?.expirationDate2 || "",
        documentTitle3: i9Form.section2?.documentTitle3 || "",
        issuingAuthority3: i9Form.section2?.issuingAuthority3 || "",
        documentNumber3: i9Form.section2?.documentNumber3 || "",
        expirationDate3: i9Form.section2?.expirationDate3 || "",
        additionalInfo: i9Form.section2?.additionalInfo || "",
        employerSignature: i9Form.section2?.employerSignature || "",
        employerSignatureDate: i9Form.section2?.employerSignatureDate || "",
        employerName: i9Form.section2?.employerName || "",
        employerTitle: i9Form.section2?.employerTitle || "",
        employerBusinessName: i9Form.section2?.employerBusinessName || "",
        employerBusinessAddress: i9Form.section2?.employerBusinessAddress || "",
        // Metadata
        status: i9Form.status,
        createdAt: i9Form.createdAt,
        updatedAt: i9Form.updatedAt,
        hrFeedback: i9Form.hrFeedback,
      };
    }

    // Transform W4 form from nested to flat structure for frontend compatibility
    let w4FormFlattened = null;
    if (w4Form) {
      w4FormFlattened = {
        _id: w4Form._id,
        applicationId: w4Form.applicationId,
        employeeId: w4Form.employeeId,
        // Personal Information (Step 1)
        firstName: w4Form.personalInfo?.firstName || "",
        middleInitial: w4Form.personalInfo?.middleInitial || "",
        lastName: w4Form.personalInfo?.lastName || "",
        address: w4Form.personalInfo?.address || "",
        cityStateZip: w4Form.personalInfo?.cityStateZip || "",
        socialSecurityNumber: w4Form.personalInfo?.socialSecurityNumber || "",
        filingStatus:
          mapFilingStatusToFrontend(w4Form.personalInfo?.filingStatus) || "",
        // Multiple Jobs Option (Step 2)
        multipleJobsOption: w4Form.multipleJobsOption || "",
        // Dependents (Step 3)
        qualifyingChildren: w4Form.dependents?.qualifyingChildren || "",
        otherDependents: w4Form.dependents?.otherDependents || "",
        totalCredits: w4Form.dependents?.totalCredits || "",
        // Other Adjustments (Step 4)
        otherIncome: w4Form.otherAdjustments?.otherIncome || "",
        deductions: w4Form.otherAdjustments?.deductions || "",
        extraWithholding: w4Form.otherAdjustments?.extraWithholding || "",
        // Employee Signature (Step 5)
        employeeSignature: w4Form.employeeSignature || "",
        signatureDate: w4Form.signatureDate || "",
        exempt: w4Form.exempt || false,
        // Employer Information
        employerName: w4Form.employerInfo?.employerName || "",
        employerAddress: w4Form.employerInfo?.employerAddress || "",
        firstDateOfEmployment: w4Form.employerInfo?.firstDateOfEmployment || "",
        employerEIN: w4Form.employerInfo?.employerEIN || "",
        // Metadata
        createdAt: w4Form.createdAt,
        updatedAt: w4Form.updatedAt,
        status: w4Form.status,
        hrFeedback: w4Form.hrFeedback,
      };
    }

    // Transform W9 form for frontend compatibility
    let w9FormFlattened = null;
    if (w9Form) {
      w9FormFlattened = {
        ...w9Form.toObject(),
        taxClassification: mapTaxClassificationToFrontend(
          w9Form.taxClassification
        ),
      };
    }

    // Transform Misconduct Statement from nested to flat structure for frontend compatibility
    let misconductStatementFlattened = null;
    if (misconductStatement) {
      misconductStatementFlattened = {
        _id: misconductStatement._id,
        applicationId: misconductStatement.applicationId,
        employeeId: misconductStatement.employeeId,
        // Staff Information (flattened from staffInfo)
        staffTitle: misconductStatement.staffInfo?.staffTitle || "",
        employeeName: misconductStatement.staffInfo?.employeeName || "",
        employmentPosition:
          misconductStatement.staffInfo?.employmentPosition || "",
        // Acknowledgment fields
        understandsCodeOfConduct:
          misconductStatement.acknowledgment?.understandsCodeOfConduct || false,
        noMisconductHistory:
          misconductStatement.acknowledgment?.noMisconductHistory || false,
        formReadAndUnderstood:
          misconductStatement.acknowledgment?.formReadAndUnderstood || false,
        // Employee signature (flattened from employeeSignature)
        signature: misconductStatement.employeeSignature?.signature || "",
        date: misconductStatement.employeeSignature?.date || null,
        // Verifier/Witness (flattened from verifier)
        witnessName: misconductStatement.verifier?.printedName || "",
        witnessSignature: misconductStatement.verifier?.signature || "",
        witnessDate: misconductStatement.verifier?.date || null,
        witnessStatement: misconductStatement.verifier?.statement || "",
        // Notary information (flattened from notaryInfo)
        notaryDate: misconductStatement.notaryInfo?.day?.toString() || "",
        notaryMonth: misconductStatement.notaryInfo?.month || "",
        notaryYear: misconductStatement.notaryInfo?.year?.toString() || "",
        notarySignature: misconductStatement.notaryInfo?.notarySignature || "",
        notarySeal: misconductStatement.notaryInfo?.notarySeal || "",
        // Metadata
        createdAt: misconductStatement.createdAt,
        updatedAt: misconductStatement.updatedAt,
        status: misconductStatement.status,
        hrFeedback: misconductStatement.hrFeedback,
      };
    }

    // Transform Code of Ethics data for frontend compatibility
    let codeOfEthicsFlattened = codeOfEthics;
    if (codeOfEthics) {
      codeOfEthicsFlattened = {
        ...codeOfEthics.toObject(),
        signature: codeOfEthics.employeeSignature || "",
        date: codeOfEthics.signatureDate || null,
        // Include the actual uploaded document information
        employeeUploadedForm: codeOfEthics.employeeUploadedForm || null,
      };
    }

    // Transform Service Delivery Policy data for frontend compatibility
    let serviceDeliveryPolicyFlattened = serviceDeliveryPolicy;
    if (serviceDeliveryPolicy) {
      serviceDeliveryPolicyFlattened = {
        ...serviceDeliveryPolicy.toObject(),
        employeeDate: serviceDeliveryPolicy.employeeSignatureDate || null,
        agencySignature: serviceDeliveryPolicy.supervisorSignature || "",
        agencyDate: serviceDeliveryPolicy.supervisorSignatureDate || null,
      };
    }

    // Transform Non-Compete Agreement data for frontend compatibility
    let nonCompeteAgreementFlattened = nonCompeteAgreement;
    if (nonCompeteAgreement) {
      nonCompeteAgreementFlattened = {
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
        agreementYear:
          nonCompeteAgreement.effectiveDate?.year?.toString() || "",
        // Map employee info
        employeeName: nonCompeteAgreement.employeeInfo?.employeeName || "",
        employeeAddress: nonCompeteAgreement.employeeInfo?.address || "",
        jobTitle: nonCompeteAgreement.employeeInfo?.position || "",
        // Map company representative
        companyRepName: nonCompeteAgreement.companyRepresentative?.name || "",
        companyRepSignature:
          nonCompeteAgreement.companyRepresentative?.signature || "",
        // Include uploaded form
        employeeUploadedForm: nonCompeteAgreement.employeeUploadedForm || null,
      };
    }

    // Transform Orientation Checklist data for frontend compatibility
    let orientationChecklistFlattened = orientationChecklist;
    if (orientationChecklist) {
      orientationChecklistFlattened = {
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
        hrFeedback: orientationChecklist.hrFeedback,
      };
    }

    // Transform Employment Application data for frontend compatibility
    let employmentAppFlattened = employmentApp;
    if (employmentApp) {
      // Employment application model already matches frontend structure
      employmentAppFlattened = {
        _id: employmentApp._id,
        applicationId: employmentApp.applicationId,
        employeeId: employmentApp.employeeId,
        applicantInfo: employmentApp.applicantInfo || {},
        education: employmentApp.education || {},
        employment: employmentApp.employment || [],
        references: employmentApp.references || [],
        militaryService: employmentApp.militaryService || {},
        legalQuestions: employmentApp.legalQuestions || {},
        signature: employmentApp.signature || "",
        signatureDate: employmentApp.signatureDate || null,
        date: employmentApp.date || null,
        status: employmentApp.status || "draft",
        createdAt: employmentApp.createdAt,
        updatedAt: employmentApp.updatedAt,
        hrFeedback: employmentApp.hrFeedback,
      };
    }

    // Check if forms are editable (only if status is draft or submitted, NOT approved)
    const isEditable =
      ["draft"].includes(application.applicationStatus) &&
      application.applicationStatus !== "approved";

    // Get position type to filter relevant forms
    const selectedPosition = positionType?.positionAppliedFor || "";
    console.log('🎯 [Backend] Selected Position:', selectedPosition);
    
    const relevantJobDescriptionForms = getRelevantJobDescriptionForms(selectedPosition);
    console.log('📝 [Backend] Relevant Job Description Forms:', relevantJobDescriptionForms);
    
    const isPCA = selectedPosition === 'PCA';
    console.log('🎓 [Backend] Is PCA:', isPCA);
    console.log('📚 [Backend] PCA Training Questions exists:', !!pcaTrainingQuestionsCreated);

    const response = {
      application,
      isEditable, // Add editable status
      forms: {
        personalInformation: personalInformation
          ? {
              ...personalInformation.toObject(),
              isEditable: isFormEditable(
                personalInformation.status,
                application.applicationStatus
              ),
            }
          : null,
        professionalExperience: professionalExperience
          ? {
              ...professionalExperience.toObject(),
              isEditable: isFormEditable(
                professionalExperience.status,
                application.applicationStatus
              ),
            }
          : null,
        education: education
          ? {
              ...education.toObject(),
              isEditable: isFormEditable(
                education.status,
                application.applicationStatus
              ),
            }
          : null,
        references: references
          ? {
              ...references.toObject(),
              isEditable: isFormEditable(
                references.status,
                application.applicationStatus
              ),
            }
          : null,
        legalDisclosures: legalDisclosures
          ? {
              ...legalDisclosures.toObject(),
              isEditable: isFormEditable(
                legalDisclosures.status,
                application.applicationStatus
              ),
            }
          : null,
        positionType: positionType
          ? {
              ...positionType.toObject(),
              isEditable: isFormEditable(
                positionType.status,
                application.applicationStatus
              ),
            }
          : null,
        employmentApplication: employmentAppFlattened
          ? {
              ...employmentAppFlattened,
              isEditable: isFormEditable(
                employmentAppFlattened.status,
                application.applicationStatus
              ),
            }
          : null,
        orientationPresentation: orientationPresentation
          ? {
              ...orientationPresentation.toObject(),
              isEditable: isFormEditable(
                orientationPresentation.status,
                application.applicationStatus
              ),
            }
          : null,
        i9Form: i9FormFlattened
          ? {
              ...i9FormFlattened,
              isEditable: isFormEditable(
                i9FormFlattened.status,
                application.applicationStatus
              ),
            }
          : null,
        w4Form: w4FormFlattened
          ? {
              ...w4FormFlattened,
              isEditable: isFormEditable(
                w4FormFlattened.status,
                application.applicationStatus
              ),
            }
          : null,
        w9Form: w9FormFlattened
          ? {
              ...w9FormFlattened,
              isEditable: isFormEditable(
                w9FormFlattened.status,
                application.applicationStatus
              ),
            }
          : null,
        emergencyContact: emergencyContact
          ? {
              ...emergencyContact.toObject(),
              isEditable: isFormEditable(
                emergencyContact.status,
                application.applicationStatus
              ),
            }
          : null,
        directDeposit: directDeposit
          ? {
              ...directDeposit.toObject(),
              isEditable: isFormEditable(
                directDeposit.status,
                application.applicationStatus
              ),
            }
          : null,
        misconductStatement: misconductStatementFlattened
          ? {
              ...misconductStatementFlattened,
              isEditable: isFormEditable(
                misconductStatementFlattened.status,
                application.applicationStatus
              ),
            }
          : null,
        codeOfEthics: codeOfEthicsFlattened
          ? {
              ...codeOfEthicsFlattened,
              isEditable: isFormEditable(
                codeOfEthicsFlattened.status,
                application.applicationStatus
              ),
            }
          : null,
        serviceDeliveryPolicy: serviceDeliveryPolicyFlattened
          ? {
              ...serviceDeliveryPolicyFlattened,
              isEditable: isFormEditable(
                serviceDeliveryPolicyFlattened.status,
                application.applicationStatus
              ),
            }
          : null,
        nonCompeteAgreement: nonCompeteAgreementFlattened
          ? {
              ...nonCompeteAgreementFlattened,
              isEditable: isFormEditable(
                nonCompeteAgreementFlattened.status,
                application.applicationStatus
              ),
            }
          : null,
        backgroundCheck: backgroundCheck
          ? {
              ...backgroundCheck.toObject(),
              isEditable: isFormEditable(
                backgroundCheck.status,
                application.applicationStatus
              ),
            }
          : null,
        tbSymptomScreen: tbSymptomScreen
          ? {
              ...tbSymptomScreen.toObject(),
              isEditable: isFormEditable(
                tbSymptomScreen.status,
                application.applicationStatus
              ),
            }
          : null,
        orientationChecklist: orientationChecklistFlattened
          ? {
              ...orientationChecklistFlattened,
              isEditable: isFormEditable(
                orientationChecklistFlattened.status,
                application.applicationStatus
              ),
            }
          : null,
        // Only include job description forms relevant to selected position
        ...(relevantJobDescriptionForms.includes('jobDescriptionPCA') && {
          jobDescriptionPCA: jobDescriptionPCACreated
            ? {
                ...jobDescriptionPCACreated.toObject(),
                isEditable: isFormEditable(
                  jobDescriptionPCACreated.status,
                  application.applicationStatus
                ),
              }
            : null,
        }),
        ...(relevantJobDescriptionForms.includes('jobDescriptionCNA') && {
          jobDescriptionCNA: jobDescriptionCNACreated
            ? {
                ...jobDescriptionCNACreated.toObject(),
                isEditable: isFormEditable(
                  jobDescriptionCNACreated.status,
                  application.applicationStatus
                ),
              }
            : null,
        }),
        ...(relevantJobDescriptionForms.includes('jobDescriptionLPN') && {
          jobDescriptionLPN: jobDescriptionLPNCreated
            ? {
                ...jobDescriptionLPNCreated.toObject(),
                isEditable: isFormEditable(
                  jobDescriptionLPNCreated.status,
                  application.applicationStatus
                ),
              }
            : null,
        }),
        ...(relevantJobDescriptionForms.includes('jobDescriptionRN') && {
          jobDescriptionRN: jobDescriptionRNCreated
            ? {
                ...jobDescriptionRNCreated.toObject(),
                isEditable: isFormEditable(
                  jobDescriptionRNCreated.status,
                  application.applicationStatus
                ),
              }
            : null,
        }),
        workExperience: workExperience
          ? {
              ...workExperience.toObject(),
              isEditable: isFormEditable(
                workExperience.status,
                application.applicationStatus
              ),
            }
          : null,
        // Only include PCA Training Questions for PCA position
        ...(isPCA && {
          pcaTrainingQuestions: pcaTrainingQuestionsCreated
            ? {
                ...pcaTrainingQuestionsCreated.toObject(),
                isEditable: isFormEditable(
                  pcaTrainingQuestionsCreated.status,
                  application.applicationStatus
                ),
              }
            : null,
        }),
      },
    };

    // Log what's being returned for PCA users
    if (isPCA) {
      console.log('✅ [Backend] Returning PCA Training Questions:', !!response.forms.pcaTrainingQuestions);
      console.log('📊 [Backend] PCA Training Questions Status:', response.forms.pcaTrainingQuestions?.status);
    }

    res.status(200).json({
      message: "Application data retrieved successfully",
      data: response,
    });
  } catch (error) {
    console.error("Error getting application:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Get all onboarding applications (HR view)
router.get("/get-all-applications", async (req, res) => {
  try {
    const applications = await OnboardingApplication.find()
      .populate("employeeId", "userName email phoneNumber position")
      .populate("reviewedBy", "userName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "All onboarding applications retrieved successfully",
      applications,
    });
  } catch (error) {
    console.error("Error getting all applications:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Update application status (Regular approval - goes to Kanban todo)
router.put("/update-status/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, reviewComments, reviewedBy } = req.body;

    const application = await OnboardingApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // PREVENT CHANGES: Check if application is already finally approved
    if (application.applicationStatus === "approved") {
      // Check if any forms have "approved" status (indicates final approval)
      const employmentApp = await EmploymentApplication.findOne({
        applicationId,
        status: "approved",
      });
      if (employmentApp) {
        return res.status(403).json({
          message:
            "Cannot modify application - This application has been FINALLY APPROVED and is locked",
          error: "APPLICATION_LOCKED",
          lockReason: "FINAL_APPROVAL_COMPLETE",
        });
      }
    }

    application.applicationStatus = status;
    if (reviewComments) application.reviewComments = reviewComments;

    // Only set reviewedBy if it's a valid ObjectId, otherwise skip it
    if (reviewedBy && mongoose.Types.ObjectId.isValid(reviewedBy)) {
      application.reviewedBy = reviewedBy;
    }

    if (status === "submitted") {
      application.submittedAt = new Date();
    }

    if (["approved", "rejected"].includes(status)) {
      application.reviewedAt = new Date();
    }

    await application.save();

    res.status(200).json({
      message: "Application status updated successfully",
      application,
      approvalType: "regular", // Indicates this goes to Kanban todo
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Final approve application (Complete approval - goes directly to Kanban complete and locks forms)
router.put("/final-approve/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { reviewComments, reviewedBy } = req.body;

    const application = await OnboardingApplication.findById(
      applicationId
    ).populate("employeeId", "userName email phoneNumber position");
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // PREVENT DUPLICATE FINAL APPROVAL: Check if application is already finally approved
    if (application.applicationStatus === "approved") {
      const employmentApp = await EmploymentApplication.findOne({
        applicationId,
        status: "approved",
      });
      if (employmentApp) {
        return res.status(403).json({
          message:
            "Application has already been FINALLY APPROVED and is locked",
          error: "ALREADY_FINALLY_APPROVED",
          lockReason: "FINAL_APPROVAL_COMPLETE",
        });
      }
    }

    // Update application status to approved
    application.applicationStatus = "approved";
    application.reviewComments =
      reviewComments ||
      "Application finally approved - all onboarding complete";
    application.reviewedAt = new Date();
    application.completionPercentage = 100;

    // Only set reviewedBy if it's a valid ObjectId, otherwise skip it
    if (reviewedBy && mongoose.Types.ObjectId.isValid(reviewedBy)) {
      application.reviewedBy = reviewedBy;
    }

    // Update all forms to approved status and lock them from editing
    await Promise.all([
      PersonalInformation.updateMany(
        { applicationId },
        { status: "approved" }
      ),
      ProfessionalExperience.updateMany(
        { applicationId },
        { status: "approved" }
      ),
      WorkExperience.updateMany({ applicationId }, { status: "approved" }),
      Education.updateMany({ applicationId }, { status: "approved" }),
      References.updateMany({ applicationId }, { status: "approved" }),
      LegalDisclosures.updateMany({ applicationId }, { status: "approved" }),
      EmploymentApplication.updateMany(
        { applicationId },
        { status: "approved" }
      ),
      I9Form.updateMany({ applicationId }, { status: "approved" }),
      W4Form.updateMany({ applicationId }, { status: "approved" }),
      W9Form.updateMany({ applicationId }, { status: "approved" }),
      EmergencyContact.updateMany({ applicationId }, { status: "approved" }),
      DirectDeposit.updateMany({ applicationId }, { status: "approved" }),
      MisconductStatement.updateMany({ applicationId }, { status: "approved" }),
      CodeOfEthics.updateMany({ applicationId }, { status: "approved" }),
      ServiceDeliveryPolicy.updateMany(
        { applicationId },
        { status: "approved" }
      ),
      NonCompeteAgreement.updateMany({ applicationId }, { status: "approved" }),
      PositionType.updateMany({ applicationId }, { status: "approved" }),
      OrientationPresentation.updateMany({ applicationId }, { status: "approved" }),
      BackgroundCheck.updateMany({ applicationId }, { status: "approved" }),
      TBSymptomScreen.updateMany({ applicationId }, { status: "approved" }),
      OrientationChecklist.updateMany(
        { applicationId },
        { status: "approved" }
      ),
      PCAJobDescription.updateMany({ applicationId }, { status: "approved" }),
      CNAJobDescription.updateMany({ applicationId }, { status: "approved" }),
      LPNJobDescription.updateMany({ applicationId }, { status: "approved" }),
      RNJobDescription.updateMany({ applicationId }, { status: "approved" }),
    ]);

    await application.save();

    res.status(200).json({
      message: "Application finally approved successfully",
      application,
      approvalType: "final", // Indicates this goes directly to Kanban complete
      employeeInfo: {
        name: application.employeeId?.userName || "Unknown Employee",
        email: application.employeeId?.email || "",
        position: application.employeeId?.position || "New Employee",
      },
    });
  } catch (error) {
    console.error("Error finally approving application:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Submit application to HR
router.put("/submit-application/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await OnboardingApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Check if all required forms are completed
    const requiredForms = [
      { model: PersonalInformation, name: "Personal Information" },
      { model: ProfessionalExperience, name: "Professional Experience" },
      { model: EmploymentApplication, name: "Employment Application" },
      { model: I9Form, name: "I-9 Form" },
      { model: W4Form, name: "W-4 Form" },
      { model: EmergencyContact, name: "Emergency Contact" },
      { model: MisconductStatement, name: "Staff Statement of Misconduct" },
      { model: CodeOfEthics, name: "Code of Ethics" },
      { model: BackgroundCheck, name: "Background Check Form" },
      { model: TBSymptomScreen, name: "TB Symptom Screen" },
    ];

    const incompleteforms = [];
    for (const form of requiredForms) {
      const formData = await form.model.findOne({
        applicationId,
        status: { $in: ["submitted", "completed"] },
      });
      if (!formData) {
        incompleteforms.push(form.name);
      }
    }

    if (incompleteforms.length > 0) {
      return res.status(400).json({
        message:
          "Cannot submit application. The following forms are incomplete:",
        incompleteforms,
      });
    }

    // Change all completed forms to submitted status
    await Promise.all([
      PersonalInformation.updateMany(
        { applicationId, status: "completed" },
        { status: "submitted" }
      ),
      ProfessionalExperience.updateMany(
        { applicationId, status: "completed" },
        { status: "submitted" }
      ),
      WorkExperience.updateMany(
        { applicationId, status: "completed" },
        { status: "submitted" }
      ),
      Education.updateMany(
        { applicationId, status: "completed" },
        { status: "submitted" }
      ),
      References.updateMany(
        { applicationId, status: "completed" },
        { status: "submitted" }
      ),
      LegalDisclosures.updateMany(
        { applicationId, status: "completed" },
        { status: "submitted" }
      ),
      EmploymentApplication.updateMany(
        { applicationId, status: "completed" },
        { status: "submitted" }
      ),
      I9Form.updateMany(
        { applicationId, status: "completed" },
        { status: "submitted" }
      ),
      W4Form.updateMany(
        { applicationId, status: "completed" },
        { status: "submitted" }
      ),
      W9Form.updateMany(
        { applicationId, status: "completed" },
        { status: "submitted" }
      ),
      EmergencyContact.updateMany(
        { applicationId, status: "completed" },
        { status: "submitted" }
      ),
      DirectDeposit.updateMany(
        { applicationId, status: "completed" },
        { status: "submitted" }
      ),
      MisconductStatement.updateMany(
        { applicationId, status: "completed" },
        { status: "submitted" }
      ),
      CodeOfEthics.updateMany(
        { applicationId, status: "completed" },
        { status: "submitted" }
      ),
      ServiceDeliveryPolicy.updateMany(
        { applicationId, status: "completed" },
        { status: "submitted" }
      ),
      NonCompeteAgreement.updateMany(
        { applicationId, status: "completed" },
        { status: "submitted" }
      ),
      PositionType.updateMany(
        { applicationId, status: "completed" },
        { status: "submitted" }
      ),
      OrientationPresentation.updateMany(
        { applicationId, status: "completed" },
        { status: "submitted" }
      ),
      BackgroundCheck.updateMany(
        { applicationId, status: "completed" },
        { status: "submitted" }
      ),
      TBSymptomScreen.updateMany(
        { applicationId, status: "completed" },
        { status: "submitted" }
      ),
      OrientationChecklist.updateMany(
        { applicationId, status: "completed" },
        { status: "submitted" }
      ),
      PCAJobDescription.updateMany(
        { applicationId, status: "completed" },
        { status: "submitted" }
      ),
      CNAJobDescription.updateMany(
        { applicationId, status: "completed" },
        { status: "submitted" }
      ),
      LPNJobDescription.updateMany(
        { applicationId, status: "completed" },
        { status: "submitted" }
      ),
      RNJobDescription.updateMany(
        { applicationId, status: "completed" },
        { status: "submitted" }
      ),
    ]);

    application.applicationStatus = "submitted";
    application.submittedAt = new Date();
    application.completionPercentage = 100;

    await application.save();

    res.status(200).json({
      message: "Application submitted successfully to HR",
      application,
    });
  } catch (error) {
    console.error("Error submitting application:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// DEBUG ENDPOINT - Force all forms to completed status
router.post("/debug-fix-forms/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;
    console.log("Fixing form statuses for application:", applicationId);

    // Update all forms to completed status
    const updateResults = await Promise.all([
      PersonalInformation.updateMany(
        { applicationId },
        { status: "completed" }
      ),
      ProfessionalExperience.updateMany(
        { applicationId },
        { status: "completed" }
      ),
      EmploymentApplication.updateMany(
        { applicationId },
        { status: "completed" }
      ),
      I9Form.updateMany({ applicationId }, { status: "completed" }),
      W4Form.updateMany({ applicationId }, { status: "completed" }),
      W9Form.updateMany({ applicationId }, { status: "completed" }),
      EmergencyContact.updateMany({ applicationId }, { status: "completed" }),
      DirectDeposit.updateMany({ applicationId }, { status: "completed" }),
      MisconductStatement.updateMany(
        { applicationId },
        { status: "completed" }
      ),
      CodeOfEthics.updateMany({ applicationId }, { status: "completed" }),
      ServiceDeliveryPolicy.updateMany(
        { applicationId },
        { status: "completed" }
      ),
      NonCompeteAgreement.updateMany(
        { applicationId },
        { status: "completed" }
      ),
      PositionType.updateMany({ applicationId }, { status: "completed" }),
      OrientationPresentation.updateMany({ applicationId }, { status: "completed" }),
      BackgroundCheck.updateMany({ applicationId }, { status: "completed" }),
      TBSymptomScreen.updateMany({ applicationId }, { status: "completed" }),
      OrientationChecklist.updateMany(
        { applicationId },
        { status: "completed" }
      ),
      JobDescriptionAcknowledgment.updateMany(
        { applicationId },
        { status: "completed" }
      ),
      PCAJobDescription.updateMany({ applicationId }, { status: "completed" }),
      CNAJobDescription.updateMany({ applicationId }, { status: "completed" }),
      LPNJobDescription.updateMany({ applicationId }, { status: "completed" }),
      RNJobDescription.updateMany({ applicationId }, { status: "completed" }),
    ]);

    // Update application completion
    const application = await OnboardingApplication.findById(applicationId);
    if (application) {
      application.completedForms = [
        "Personal Information",
        "Professional Experience",
        "Employment Application",
        "I-9 Form",
        "W-4 Form",
        "W-9 Form",
        "Emergency Contact",
        "Direct Deposit",
        "Staff Statement of Misconduct",
        "Code of Ethics",
        "Service Delivery Policy",
        "Non-Compete Agreement",
        "Background Check Form",
        "TB Symptom Screen",
        "Orientation Checklist",
        "Job Description Acknowledgment",
      ];
      application.completionPercentage = 100;
      await application.save();
    }

    res.status(200).json({
      message: "All forms forced to completed status",
      updateResults: updateResults.map((result) => result.modifiedCount),
      application,
    });
  } catch (error) {
    console.error("Error fixing forms:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

// Submit HR notes/feedback for a specific form
router.post("/submit-notes", async (req, res) => {
  try {
    console.log("📝 HR Notes submission received:", req.body);
    console.log("📝 Request params:", req.params);
    console.log("📝 Request query:", req.query);

    const {
      userId,
      employeeId, // accept employeeId as alias of userId
      notes,
      formType,
      timestamp,
      formId,
      applicationId,
      status,
      reviewedBy,
      companyRepSignature,
      notarySignature,
      agencySignature,
      clientSignature,
    } = req.body;

    console.log("📝 Extracted userId:", userId, "Type:", typeof userId);
    console.log(
      "📝 Extracted employeeId:",
      employeeId,
      "Type:",
      typeof employeeId
    );
    console.log(
      "📝 Is userId valid ObjectId?",
      mongoose.Types.ObjectId.isValid(userId)
    );
    console.log("📝 Extracted formType:", formType);
    console.log("📝 Extracted agencySignature:", agencySignature);

    // Enhanced validation
    if (!notes || notes.trim().length === 0) {
      return res.status(400).json({
        message: "Notes/comment is required",
      });
    }

    // Map frontend form types to database models
    const formModelMapping = {
      PersonalInformation: PersonalInformation,
      ProfessionalExperience: ProfessionalExperience,
      W9Form: W9Form,
      W4Form: W4Form,
      I9Form: I9Form,
      EmploymentApplication: EmploymentApplication,
      EmergencyContact: EmergencyContact,
      DirectDeposit: DirectDeposit,
      DirectDepositForm: DirectDeposit, // Added mapping for frontend form type
      MisconductStatement: MisconductStatement,
      CodeOfEthics: CodeOfEthics,
      ServiceDeliveryPolicy: ServiceDeliveryPolicy,
      ServiceDeliveryPolicies: ServiceDeliveryPolicy, // Added plural mapping
      NonCompeteAgreement: NonCompeteAgreement,
      PositionType: PositionType,
      OrientationPresentation: OrientationPresentation,
      BackgroundCheck: BackgroundCheck,
      BackgroundCheckForm: BackgroundCheck, // Added mapping for frontend form type
      TBSymptomScreen: TBSymptomScreen,
      OrientationChecklist: OrientationChecklist,
      JobDescriptionAcknowledgment: JobDescriptionAcknowledgment,
      PersonalCare: PCAJobDescription, // Added mapping for PCA job description
      CertifiedNursingAssistant: CNAJobDescription, // Added mapping for CNA job description
      LicensedPracticalNurse: LPNJobDescription, // Added mapping for LPN job description
      RegisteredNurse: RNJobDescription, // Added mapping for RN job description
      OrientationChecklist: OrientationChecklist,
    };

    const FormModel = formModelMapping[formType];
    if (!FormModel) {
      return res.status(400).json({
        message: `Invalid form type: ${formType}`,
      });
    }

    // Find the form - try multiple approaches
    let form = null;
    let actualEmployeeId = null; // Declare at the top level

    if (formId) {
      form = await FormModel.findById(formId);
    } else if (applicationId) {
      form = await FormModel.findOne({ applicationId });
    } else if (userId || employeeId) {
      // Handle both ObjectId and email for provided user identifier
      actualEmployeeId = userId || employeeId;

      // If provided id is not a valid ObjectId, try to find the user by email first
      if (!mongoose.Types.ObjectId.isValid(actualEmployeeId)) {
        try {
          const user = await User.findOne({ email: actualEmployeeId });
          if (user) {
            actualEmployeeId = user._id;
          } else {
            return res.status(404).json({
              message: `User not found with email: ${userId || employeeId}`,
            });
          }
        } catch (userError) {
          console.error("Error finding user by email:", userError);
          return res.status(500).json({
            message: "Error finding user",
            error: userError.message,
          });
        }
      }

      // Try to find by employeeId
      form = await FormModel.findOne({ employeeId: actualEmployeeId });

      if (!form) {
        // If not found by employeeId, try to find application first
        const application = await OnboardingApplication.findOne({
          employeeId: actualEmployeeId,
        });
        if (application) {
          form = await FormModel.findOne({ applicationId: application._id });
        }
      }
    }

    if (!form) {
      return res.status(404).json({
        message: `${formType} form not found for the given parameters`,
      });
    }

    console.log(`✅ Found ${formType} form:`, form._id);
    console.log(
      `📋 Current hrFeedback type:`,
      typeof form.hrFeedback,
      Array.isArray(form.hrFeedback) ? "is array" : "is not array"
    );
    console.log(`📋 Current hrFeedback value:`, form.hrFeedback);

    // Update HR feedback - use correct field names based on form type
    const jobDescriptionForms = [
      "PersonalCare",
      "CertifiedNursingAssistant",
      "LicensedPracticalNurse",
      "RegisteredNurse",
    ];
    const isJobDescriptionForm = jobDescriptionForms.includes(formType);

    console.log(`📋 Is job description form: ${isJobDescriptionForm}`);

    // Handle case where hrFeedback might be an array from previous version or any unexpected type
    if (Array.isArray(form.hrFeedback)) {
      console.log("⚠️  WARNING: hrFeedback is an array, converting to object");
      form.hrFeedback = undefined; // Clear it completely
      form.markModified("hrFeedback"); // Mark as modified for Mongoose
    }

    if (isJobDescriptionForm) {
      // Job description forms use 'notes' and 'timestamp'
      // Initialize hrFeedback - specific form handlers below will add agencySignature if provided
      form.hrFeedback = {
        notes: notes.trim(),
        reviewedBy:
          reviewedBy && mongoose.Types.ObjectId.isValid(reviewedBy)
            ? reviewedBy
            : actualEmployeeId || userId || "HR",
        timestamp: new Date(),
      };
      console.log(`📝 Setting initial job description hrFeedback (will be updated with signature below if provided)`);
    } else {
      // Other forms use 'comment' and 'reviewedAt'
      const newFeedback = {
        comment: notes.trim(),
        reviewedBy:
          reviewedBy && mongoose.Types.ObjectId.isValid(reviewedBy)
            ? reviewedBy
            : actualEmployeeId || userId || "HR",
        reviewedAt: new Date(),
      };
      console.log(`📝 Setting regular form hrFeedback:`, newFeedback);
      form.hrFeedback = newFeedback;
    }

    // Update status if provided
    if (status && ["approved", "rejected", "under_review"].includes(status)) {
      form.status = status;
    } else {
      // Default to under_review when HR adds feedback
      form.status = "under_review";
    }

    // If NonCompeteAgreement and companyRepSignature provided, persist it
    if (formType === "NonCompeteAgreement" && companyRepSignature) {
      try {
        form.companyRepresentative = form.companyRepresentative || {};
        form.companyRepresentative.signature = companyRepSignature;
      } catch (e) {
        console.warn(
          "Failed to set company representative signature on form:",
          e.message
        );
      }
    }

    // If MisconductStatement and notarySignature provided, persist it
    if (formType === "MisconductStatement" && notarySignature) {
      try {
        form.notaryInfo = form.notaryInfo || {};
        form.notaryInfo.notarySignature = notarySignature;
      } catch (e) {
        console.warn(
          "Failed to set notary signature on MisconductStatement:",
          e.message
        );
      }
    }

    // If ServiceDeliveryPolicy and agencySignature provided, persist it to supervisorSignature
    if (
      (formType === "ServiceDeliveryPolicy" ||
        formType === "ServiceDeliveryPolicies") &&
      agencySignature
    ) {
      try {
        form.supervisorSignature = agencySignature;
        // Optionally set date when HR reviews
        form.supervisorSignatureDate = new Date();
        // Also surface in hrFeedback for easy frontend rendering
        form.hrFeedback = {
          ...(form.hrFeedback?.toObject
            ? form.hrFeedback.toObject()
            : form.hrFeedback),
          comment: (notes || "").trim(),
          reviewedBy:
            reviewedBy && mongoose.Types.ObjectId.isValid(reviewedBy)
              ? reviewedBy
              : actualEmployeeId || userId || "HR",
          reviewedAt: new Date(),
          agencySignature: agencySignature,
        };
      } catch (e) {
        console.warn(
          "Failed to set agency/supervisor signature on ServiceDeliveryPolicy:",
          e.message
        );
      }
    }

    // If CertifiedNursingAssistant job description and agencySignature provided, persist it to supervisorSignature
    if (formType === "CertifiedNursingAssistant" && agencySignature) {
      try {
        console.log("🔧 CNA: Updating supervisor signature...");
        console.log("🔧 CNA: Current supervisorSignature:", form.supervisorSignature);
        console.log("🔧 CNA: New agencySignature:", agencySignature);
        
        form.supervisorSignature = form.supervisorSignature || {};
        // For CNA job description schema, supervisorSignature is an object with signature and date
        if (typeof form.supervisorSignature === "object") {
          form.supervisorSignature.signature = agencySignature;
          form.supervisorSignature.date = new Date();
          form.supervisorSignature.digitalSignature = true;
        } else {
          // In unexpected shape, overwrite with object
          form.supervisorSignature = {
            signature: agencySignature,
            date: new Date(),
            digitalSignature: true,
          };
        }
        
        console.log("🔧 CNA: Updated supervisorSignature:", form.supervisorSignature);
        
        // Add agencySignature to existing hrFeedback
        if (!form.hrFeedback) {
          form.hrFeedback = {};
        }
        form.hrFeedback.agencySignature = agencySignature;
        form.markModified('hrFeedback');
        
        console.log("🔧 CNA: Updated hrFeedback with agencySignature:", form.hrFeedback);
      } catch (e) {
        console.error(
          "❌ Failed to set supervisor signature on CNA Job Description:",
          e.message
        );
      }
    }

    // If PersonalCare (PCA) job description and agencySignature provided, persist it to supervisorSignature
    if (formType === "PersonalCare" && agencySignature) {
      try {
        console.log("🔧 PCA: Updating supervisor signature...");
        console.log("🔧 PCA: New agencySignature:", agencySignature);
        
        form.supervisorSignature = form.supervisorSignature || {};
        if (typeof form.supervisorSignature === "object") {
          form.supervisorSignature.signature = agencySignature;
          form.supervisorSignature.date = new Date();
          form.supervisorSignature.digitalSignature = true;
        } else {
          form.supervisorSignature = {
            signature: agencySignature,
            date: new Date(),
            digitalSignature: true,
          };
        }
        
        console.log("🔧 PCA: Updated supervisorSignature:", form.supervisorSignature);
        
        // Add agencySignature to existing hrFeedback
        if (!form.hrFeedback) {
          form.hrFeedback = {};
        }
        form.hrFeedback.agencySignature = agencySignature;
        form.markModified('hrFeedback');
        
        console.log("🔧 PCA: Updated hrFeedback with agencySignature:", form.hrFeedback);
      } catch (e) {
        console.error(
          "❌ Failed to set supervisor signature on PCA Job Description:",
          e.message
        );
      }
    }

    // If LicensedPracticalNurse (LPN) job description and agencySignature provided, persist it to supervisorSignature
    if (formType === "LicensedPracticalNurse" && agencySignature) {
      try {
        console.log("🔧 LPN: Updating supervisor signature...");
        console.log("🔧 LPN: Current supervisorSignature:", form.supervisorSignature);
        console.log("🔧 LPN: New agencySignature:", agencySignature);
        
        form.supervisorSignature = form.supervisorSignature || {};
        if (typeof form.supervisorSignature === "object") {
          form.supervisorSignature.signature = agencySignature;
          form.supervisorSignature.date = new Date();
          form.supervisorSignature.digitalSignature = true;
        } else {
          form.supervisorSignature = {
            signature: agencySignature,
            date: new Date(),
            digitalSignature: true,
          };
        }
        
        console.log("🔧 LPN: Updated supervisorSignature:", form.supervisorSignature);
        
        // Add agencySignature to existing hrFeedback
        if (!form.hrFeedback) {
          form.hrFeedback = {};
        }
        form.hrFeedback.agencySignature = agencySignature;
        form.markModified('hrFeedback');
        
        console.log("🔧 LPN: Updated hrFeedback with agencySignature:", form.hrFeedback);
      } catch (e) {
        console.error(
          "❌ Failed to set supervisor signature on LPN Job Description:",
          e.message
        );
      }
    }

    // If RegisteredNurse (RN) job description and agencySignature provided, do NOT persist it into form.supervisorSignature here.
    // Supervisor signatures for RN are managed by HR and should not block employee registration. We will surface the agencySignature in hrFeedback for frontend display only.
    if (formType === "RegisteredNurse" && agencySignature) {
      try {
        form.hrFeedback = {
          ...(form.hrFeedback?.toObject
            ? form.hrFeedback.toObject()
            : form.hrFeedback),
          comment: (notes || "").trim(),
          reviewedBy:
            reviewedBy && mongoose.Types.ObjectId.isValid(reviewedBy)
              ? reviewedBy
              : actualEmployeeId || userId || "HR",
          reviewedAt: new Date(),
          agencySignature: agencySignature,
        };
      } catch (e) {
        console.warn(
          "Failed to attach agencySignature to RN hrFeedback:",
          e.message
        );
      }
    }

    // If OrientationChecklist and agencySignature provided, persist it to agencySignature
    if (formType === "OrientationChecklist" && agencySignature) {
      try {
        form.agencySignature = agencySignature;
        form.agencySignatureDate = new Date();
        // Also surface in hrFeedback for easy frontend rendering
        form.hrFeedback = {
          ...(form.hrFeedback?.toObject
            ? form.hrFeedback.toObject()
            : form.hrFeedback),
          comment: (notes || "").trim(),
          reviewedBy:
            reviewedBy && mongoose.Types.ObjectId.isValid(reviewedBy)
              ? reviewedBy
              : actualEmployeeId || userId || "HR",
          reviewedAt: new Date(),
          agencySignature: agencySignature,
        };
      } catch (e) {
        console.warn(
          "Failed to set agency signature on OrientationChecklist:",
          e.message
        );
      }
    }

    // If TBSymptomScreen and clientSignature provided, persist it
    if (formType === "TBSymptomScreen" && clientSignature) {
      try {
        form.clientSignature = clientSignature;
        form.clientSignatureDate = new Date();
        // Also surface in hrFeedback for easy frontend rendering
        form.hrFeedback = {
          ...(form.hrFeedback?.toObject
            ? form.hrFeedback.toObject()
            : form.hrFeedback),
          comment: (notes || "").trim(),
          reviewedBy:
            reviewedBy && mongoose.Types.ObjectId.isValid(reviewedBy)
              ? reviewedBy
              : actualEmployeeId || userId || "HR",
          reviewedAt: new Date(),
          clientSignature: clientSignature,
        };
      } catch (e) {
        console.warn(
          "Failed to set client signature on TBSymptomScreen:",
          e.message
        );
      }
    }

    await form.save();

    console.log(`✅ HR feedback saved for ${formType}:`, form.hrFeedback);
    console.log(`✅ Supervisor signature saved:`, form.supervisorSignature);

    // Prepare response based on form type
    const responseData = {
      _id: form._id,
      formType,
      status: form.status,
      hrFeedback: form.hrFeedback,
    };

    // Include supervisor signature for job description forms
    if (jobDescriptionForms.includes(formType) && form.supervisorSignature) {
      responseData.supervisorSignature = form.supervisorSignature;
    }

    // Include other signatures based on form type
    if (formType === "NonCompeteAgreement" && form.companyRepresentative) {
      responseData.companyRepresentative = form.companyRepresentative;
    }
    if (formType === "MisconductStatement" && form.notaryInfo) {
      responseData.notaryInfo = form.notaryInfo;
    }

    res.status(200).json({
      message: "HR feedback submitted successfully",
      form: responseData,
    });
  } catch (error) {
    console.error("❌ Error submitting HR notes:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

module.exports = router;
