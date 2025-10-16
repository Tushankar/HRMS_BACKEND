const axios = require("axios");

const BASE_URL = "https://hrms-backend-vneb.onrender.com/onboarding";
const EMPLOYEE_ID = "67e0f8770c6feb6ba99d11d2";

async function quickTest() {
  console.log("🧪 Quick Onboarding Forms Test");
  console.log("================================");
  console.log(`Using Employee ID: ${EMPLOYEE_ID}\n`);

  let APPLICATION_ID = null;

  try {
    // Step 1: Get/Create Application
    console.log("1️⃣ Creating application...");
    const appResponse = await axios.get(
      `${BASE_URL}/get-application/${EMPLOYEE_ID}`
    );
    APPLICATION_ID = appResponse.data.data.application._id;
    console.log(`✅ Application ID: ${APPLICATION_ID}`);

    // Step 2: Test Employment Application
    console.log("\n2️⃣ Testing Employment Application...");
    const empApp = await axios.post(`${BASE_URL}/save-employment-application`, {
      applicationId: APPLICATION_ID,
      employeeId: EMPLOYEE_ID,
      formData: {
        personalInfo: {
          fullName: "Test Employee",
          address: {
            street: "123 Test St",
            city: "Test City",
            state: "CA",
            zipCode: "12345",
          },
          phoneNumber: "555-1234",
          email: "test@example.com",
          dateOfBirth: "1990-01-01",
        },
        employmentInfo: {
          positionAppliedFor: "Nurse",
          preferredShift: "Day",
        },
        legalQuestions: {
          eligibleToWork: true,
          criminalHistory: false,
        },
      },
      status: "completed",
    });
    console.log(
      `✅ Employment Application: ${empApp.status} - ${empApp.data.completionPercentage}%`
    );

    // Step 3: Test I-9 Form
    console.log("\n3️⃣ Testing I-9 Form...");
    const i9Form = await axios.post(`${BASE_URL}/save-i9-form`, {
      applicationId: APPLICATION_ID,
      employeeId: EMPLOYEE_ID,
      formData: {
        section1: {
          lastName: "Employee",
          firstName: "Test",
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
      status: "completed",
    });
    console.log(
      `✅ I-9 Form: ${i9Form.status} - ${i9Form.data.completionPercentage}%`
    );

    // Step 4: Test W-4 Form
    console.log("\n4️⃣ Testing W-4 Form...");
    const w4Form = await axios.post(`${BASE_URL}/save-w4-form`, {
      applicationId: APPLICATION_ID,
      employeeId: EMPLOYEE_ID,
      formData: {
        personalInfo: {
          firstName: "Test",
          lastName: "Employee",
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
      status: "completed",
    });
    console.log(
      `✅ W-4 Form: ${w4Form.status} - ${w4Form.data.completionPercentage}%`
    );

    // Step 5: Test Emergency Contact
    console.log("\n5️⃣ Testing Emergency Contact...");
    const emergencyContact = await axios.post(
      `${BASE_URL}/save-emergency-contact`,
      {
        applicationId: APPLICATION_ID,
        employeeId: EMPLOYEE_ID,
        formData: {
          employeeInfo: {
            fullName: "Test Employee",
            address: {
              street: "123 Test St",
              city: "Test City",
              state: "CA",
              zipCode: "12345",
            },
            homePhone: "555-1234",
            email: "test@example.com",
          },
          primaryContact: {
            name: "Emergency Contact",
            relationship: "Spouse",
            phoneNumber: "555-5678",
          },
        },
        status: "completed",
      }
    );
    console.log(
      `✅ Emergency Contact: ${emergencyContact.status} - ${emergencyContact.data.completionPercentage}%`
    );

    // Step 6: Submit Application
    console.log("\n6️⃣ Submitting Application...");
    const submitResponse = await axios.put(
      `${BASE_URL}/submit-application/${APPLICATION_ID}`
    );
    console.log(
      `✅ Application Submitted: ${submitResponse.data.application.applicationStatus}`
    );

    // Step 7: Test HR Functions
    console.log("\n7️⃣ Testing HR Functions...");
    const allApps = await axios.get(`${BASE_URL}/get-all-applications`);
    console.log(
      `✅ Retrieved ${allApps.data.applications.length} applications`
    );

    console.log("\n🎉 QUICK TEST COMPLETED SUCCESSFULLY! 🎉");
    console.log("\nYour onboarding system is working! The forms are:");
    console.log("✅ Creating applications");
    console.log("✅ Saving form data");
    console.log("✅ Tracking completion percentage");
    console.log("✅ Submitting applications");
    console.log("✅ HR functions working");
  } catch (error) {
    console.log("❌ Error:", error.response?.data?.message || error.message);
    console.log("Status:", error.response?.status);
  }
}

quickTest().catch(console.error);
