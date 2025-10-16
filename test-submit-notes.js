const axios = require("axios");

const testSubmitNotes = async () => {
  try {
    console.log("🧪 Testing submit-notes endpoint...");

    // Test data
    const testData = {
      userId: "test123",
      formType: "EmploymentApplication",
      notes: "Test HR feedback for employment application",
      timestamp: "2025-09-04T12:00:00.000Z",
    };

    console.log("📤 Sending request:", testData);

    const response = await axios.post(
      "https://hrms-backend-vneb.onrender.com/onboarding/submit-notes",
      testData,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    console.log("✅ Success! Response:", response.data);
  } catch (error) {
    console.error("❌ Error:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else if (error.request) {
      console.error("No response received:", error.message);
    } else {
      console.error("Request error:", error.message);
    }
  }
};

// Test different form types
const testAllFormTypes = async () => {
  const formTypes = [
    "EmploymentApplication",
    "W4Form",
    "PersonalCare",
    "CertifiedNursingAssistant",
  ];

  for (const formType of formTypes) {
    console.log(`\n📋 Testing ${formType}...`);
    await testSubmitNotes(formType);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second between tests
  }
};

const testSubmitNotes = async (formType) => {
  try {
    const testData = {
      userId: "test123",
      formType: formType,
      notes: `Test HR feedback for ${formType}`,
      timestamp: "2025-09-04T12:00:00.000Z",
    };

    const response = await axios.post(
      "https://hrms-backend-vneb.onrender.com/onboarding/submit-notes",
      testData,
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    console.log(`✅ ${formType}: Success!`, response.data.message);
  } catch (error) {
    console.error(
      `❌ ${formType}: Error -`,
      error.response?.data?.error || error.message
    );
  }
};

// Run the test
testAllFormTypes();
