const axios = require("axios");
const mongoose = require("mongoose");

// Connect to database first to get a real employee ID
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/hrmanagement");
    console.log("Database connected for testing");

    // Try to find an existing user or create a test user
    const User = mongoose.model(
      "User",
      new mongoose.Schema({
        name: String,
        email: String,
        role: String,
      }),
      "users"
    );

    let testEmployee = await User.findOne();

    if (!testEmployee) {
      console.log("No users found, creating test employee...");
      testEmployee = await User.create({
        name: "Test Employee",
        email: "test@example.com",
        role: "employee",
      });
      console.log("✅ Test employee created:", testEmployee._id);
    } else {
      console.log("✅ Using existing employee:", testEmployee._id);
    }

    return testEmployee._id.toString();
  } catch (error) {
    console.error("Database connection failed:", error.message);
    // Return the provided employee ID for testing
    return "67e0f8770c6feb6ba99d11d2";
  }
};

const BASE_URL = "https://hrms-backend-vneb.onrender.com/onboarding";

// Test data for each form
const testData = {
  "employment-application": {
    personalInfo: {
      fullName: "John Doe Test",
      address: {
        street: "123 Test Street",
        city: "Test City",
        state: "CA",
        zipCode: "12345",
      },
      phoneNumber: "555-1234",
      email: "john.test@email.com",
      dateOfBirth: "1990-01-01",
    },
    employmentInfo: {
      positionAppliedFor: "Test Nurse",
      preferredShift: "Day Shift",
    },
    legalQuestions: {
      eligibleToWork: true,
      criminalHistory: false,
    },
  },

  "i9-form": {
    section1: {
      lastName: "Doe",
      firstName: "John",
      middleInitial: "T",
      address: {
        street: "123 Test St",
        city: "Test City",
        state: "CA",
        zipCode: "12345",
      },
      citizenshipStatus: "us_citizen",
      signatureDate: "2025-08-25",
    },
  },

  "w4-form": {
    personalInfo: {
      firstName: "John",
      lastName: "Doe",
      address: {
        street: "123 Test St",
        city: "Test City",
        state: "CA",
        zipCode: "12345",
      },
      socialSecurityNumber: "123-45-6789",
      filingStatus: "single",
    },
    multipleJobs: {
      hasMultipleJobs: false,
      spouseWorks: false,
    },
  },

  "w9-form": {
    taxpayerInfo: {
      name: "John Doe",
      federalTaxClassification: "individual",
      address: {
        street: "123 Test St",
        city: "Test City",
        state: "CA",
        zipCode: "12345",
      },
    },
    taxIdNumbers: {
      socialSecurityNumber: "123-45-6789",
    },
    certification: {
      tinCorrect: true,
      notSubjectToBackupWithholding: true,
      usPerson: true,
    },
  },

  "emergency-contact": {
    employeeInfo: {
      fullName: "John Doe",
      address: {
        street: "123 Test St",
        city: "Test City",
        state: "CA",
        zipCode: "12345",
      },
      homePhone: "555-1234",
      email: "john.test@email.com",
    },
    primaryContact: {
      name: "Jane Doe",
      relationship: "Spouse",
      phoneNumber: "555-5678",
      email: "jane.test@email.com",
    },
    medicalInfo: {
      primaryPhysician: "Dr. Smith",
      physicianPhone: "555-9999",
    },
  },

  "direct-deposit": {
    employeeInfo: {
      fullName: "John Doe",
      employeeId: "EMP001",
      socialSecurityNumber: "123-45-6789",
      email: "john.test@email.com",
    },
    bankingInfo: {
      bankName: "Test Bank",
      routingNumber: "123456789",
      accountNumber: "987654321",
      accountType: "checking",
    },
    authorization: {
      authorizeDirectDeposit: true,
      understandTerms: true,
    },
  },

  "misconduct-statement": {
    staffInfo: {
      staffTitle: "RN",
      employeeName: "John Doe",
      employmentPosition: "Registered Nurse",
    },
    misconductStatement: {
      hasBeenConvicted: false,
      hasPendingCharges: false,
      hasBeenSanctioned: false,
      understandsResponsibilities: true,
      agreesToReportChanges: true,
    },
    acknowledgment: {
      understandsConsequences: true,
      providedTruthfulInformation: true,
      agreesToBackgroundCheck: true,
    },
  },

  "code-of-ethics": {
    employeeInfo: {
      employeeName: "John Doe",
      position: "Registered Nurse",
      department: "Healthcare",
      startDate: "2025-08-25",
    },
    ethicsAcknowledgment: {
      noPersonalUseOfClientCar: true,
      noConsumingClientFood: true,
      noPersonalPhoneCalls: true,
      noPoliticalReligiousDiscussions: true,
      professionalAppearance: true,
      respectfulTreatment: true,
      confidentialityMaintained: true,
      reportSafetyConcerns: true,
      followCompanyPolicies: true,
    },
    agreement: {
      readAndUnderstood: true,
      agreeToComply: true,
      understandConsequences: true,
      willingToSeekGuidance: true,
    },
  },

  "service-delivery-policy": {
    employeeInfo: {
      employeeName: "John Doe",
      position: "Registered Nurse",
      department: "Healthcare",
      hireDate: "2025-08-25",
    },
    policyAcknowledgments: {
      clientCare: {
        respectClientDignity: true,
        maintainClientConfidentiality: true,
        provideQualityService: true,
        followCarePlans: true,
      },
      safety: {
        followSafetyProtocols: true,
        usePersonalProtectiveEquipment: true,
        reportIncidents: true,
      },
      documentation: {
        accurateDocumentation: true,
        timelyDocumentation: true,
      },
    },
    agreement: {
      readPolicies: true,
      understoodPolicies: true,
      agreeToComply: true,
    },
  },

  "non-compete-agreement": {
    employeeInfo: {
      employeeName: "John Doe",
      position: "Registered Nurse",
      startDate: "2025-08-25",
      address: {
        street: "123 Test St",
        city: "Test City",
        state: "CA",
        zipCode: "12345",
      },
    },
    nonCompeteTerms: {
      restrictionPeriod: 12,
      geographicScope: "50 mile radius",
      industryScope: "Healthcare services",
    },
    confidentialityTerms: {
      protectTradeSecrets: true,
      protectClientInformation: true,
      returnCompanyProperty: true,
    },
    acknowledgments: {
      readAgreement: true,
      understoodTerms: true,
      agreeToTerms: true,
    },
  },

  "background-check": {
    employeeInfo: {
      fullName: "John Doe",
      dateOfBirth: "1990-01-01",
      socialSecurityNumber: "123-45-6789",
      driversLicenseNumber: "D1234567",
      driversLicenseState: "CA",
      currentAddress: {
        street: "123 Test St",
        city: "Test City",
        state: "CA",
        zipCode: "12345",
      },
      phoneNumber: "555-1234",
      email: "john.test@email.com",
    },
    authorization: {
      authorizeBackgroundCheck: true,
      authorizeContactEmployers: true,
      understoodRights: true,
      providedAccurateInfo: true,
    },
  },

  "tb-symptom-screen": {
    employeeInfo: {
      fullName: "John Doe",
      dateOfBirth: "1990-01-01",
      employeeId: "EMP001",
      department: "Healthcare",
      position: "Registered Nurse",
    },
    symptoms: {
      persistentCough: false,
      bloodInSputum: false,
      unexplainedWeightLoss: false,
      nightSweats: false,
      fever: false,
      fatigue: false,
      chestPain: false,
    },
    riskFactors: {
      closeContactWithTB: false,
      travelToHighRiskAreas: false,
      immunocompromised: false,
      diabetes: false,
    },
    certification: {
      answeredTruthfully: true,
      understandImportance: true,
      agreeToFollowUp: true,
    },
  },

  "orientation-checklist": {
    employeeInfo: {
      fullName: "John Doe",
      position: "Registered Nurse",
      department: "Healthcare",
      startDate: "2025-08-25",
      supervisor: "Jane Smith",
    },
    companyOverview: {
      companyHistoryPresented: true,
      missionVisionValues: true,
      organizationalChart: true,
      companyPolicies: true,
    },
    jobSpecificOrientation: {
      jobDescriptionReviewed: true,
      rolesResponsibilities: true,
      performanceExpectations: true,
      workSchedule: true,
    },
    safetyAndSecurity: {
      emergencyProcedures: true,
      safetyTraining: true,
      securityProtocols: true,
    },
  },
};

async function testAllForms() {
  console.log("🧪 Starting Comprehensive Onboarding Forms Test\n");
  console.log("=".repeat(60));

  let passedTests = 0;
  let failedTests = 0;
  let APPLICATION_ID = null;

  // Get a real employee ID from database
  const EMPLOYEE_ID = await connectDB();
  console.log(`🆔 Using Employee ID: ${EMPLOYEE_ID}`);

  try {
    // Step 1: Create/Get Application
    console.log("\n1️⃣ Testing Main Application Creation...");
    try {
      const appResponse = await axios.get(
        `${BASE_URL}/get-application/${EMPLOYEE_ID}`
      );
      APPLICATION_ID = appResponse.data.data.application._id;
      console.log("✅ Application created successfully");
      console.log(`   Application ID: ${APPLICATION_ID}`);
      passedTests++;
    } catch (error) {
      console.log(
        "❌ Application creation failed:",
        error.response?.data?.message || error.message
      );
      console.log(`   Status: ${error.response?.status || "Unknown"}`);
      failedTests++;
      return;
    }

    // Step 2: Test All Forms
    console.log("\n2️⃣ Testing All Individual Forms...");
    console.log("-".repeat(40));

    const forms = [
      "employment-application",
      "i9-form",
      "w4-form",
      "w9-form",
      "emergency-contact",
      "direct-deposit",
      "misconduct-statement",
      "code-of-ethics",
      "service-delivery-policy",
      "non-compete-agreement",
      "background-check",
      "tb-symptom-screen",
      "orientation-checklist",
    ];

    for (let i = 0; i < forms.length; i++) {
      const formName = forms[i];
      console.log(`\nTesting ${i + 1}/13: ${formName}...`);

      try {
        // Save form as draft
        const saveResponse = await axios.post(`${BASE_URL}/save-${formName}`, {
          applicationId: APPLICATION_ID,
          employeeId: EMPLOYEE_ID,
          formData: testData[formName],
          status: "draft",
        });

        console.log(`  💾 Save: ✅ Status ${saveResponse.status}`);

        // Retrieve form
        const getResponse = await axios.get(
          `${BASE_URL}/get-${formName}/${APPLICATION_ID}`
        );
        console.log(`  📥 Get: ✅ Status ${getResponse.status}`);

        // Complete form
        const completeResponse = await axios.post(
          `${BASE_URL}/save-${formName}`,
          {
            applicationId: APPLICATION_ID,
            employeeId: EMPLOYEE_ID,
            formData: testData[formName],
            status: "completed",
          }
        );

        console.log(`  ✅ Complete: ✅ Status ${completeResponse.status}`);
        console.log(
          `  📊 Progress: ${completeResponse.data.completionPercentage}%`
        );

        passedTests++;
      } catch (error) {
        console.log(
          `  ❌ FAILED: ${error.response?.data?.message || error.message}`
        );
        console.log(`     Status: ${error.response?.status || "Unknown"}`);
        failedTests++;
      }
    }

    // Step 3: Test Application Submission
    console.log("\n3️⃣ Testing Application Submission...");
    try {
      const submitResponse = await axios.put(
        `${BASE_URL}/submit-application/${APPLICATION_ID}`
      );
      console.log("✅ Application submitted successfully");
      console.log(
        `   Status: ${submitResponse.data.application.applicationStatus}`
      );
      passedTests++;
    } catch (error) {
      console.log(
        "❌ Application submission failed:",
        error.response?.data?.message || error.message
      );
      failedTests++;
    }

    // Step 4: Test HR Functions
    console.log("\n4️⃣ Testing HR Functions...");
    try {
      // Get all applications
      const allAppsResponse = await axios.get(
        `${BASE_URL}/get-all-applications`
      );
      console.log(
        `✅ Retrieved ${allAppsResponse.data.applications.length} applications`
      );

      // Update application status
      const statusResponse = await axios.put(
        `${BASE_URL}/update-status/${APPLICATION_ID}`,
        {
          status: "under_review",
          reviewComments: "Test review comment",
          reviewedBy: EMPLOYEE_ID,
        }
      );
      console.log("✅ Application status updated");
      console.log(
        `   New Status: ${statusResponse.data.application.applicationStatus}`
      );

      passedTests += 2;
    } catch (error) {
      console.log(
        "❌ HR functions failed:",
        error.response?.data?.message || error.message
      );
      failedTests += 2;
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
    failedTests++;
  }

  // Final Results
  console.log("\n" + "=".repeat(60));
  console.log("🏁 TESTING RESULTS");
  console.log("=".repeat(60));
  console.log(`✅ Passed Tests: ${passedTests}`);
  console.log(`❌ Failed Tests: ${failedTests}`);
  console.log(
    `📊 Success Rate: ${Math.round(
      (passedTests / (passedTests + failedTests)) * 100
    )}%`
  );

  if (failedTests === 0) {
    console.log("\n🎉 ALL TESTS PASSED! 🎉");
    console.log("Your onboarding system is working perfectly!");
  } else {
    console.log("\n⚠️  Some tests failed. Check the errors above.");
  }

  console.log("\n📋 Summary:");
  console.log(`- Total Forms Tested: 13`);
  console.log(`- API Endpoints Tested: ~30`);
  console.log(`- Application Workflow: Complete`);
  console.log(`- HR Functions: Complete`);

  // Close database connection
  await mongoose.connection.close();
}

// Run the tests
testAllForms().catch(console.error);
