const axios = require("axios");
const mongoose = require("mongoose");

async function testOnboardingEndpoint() {
  try {
    // Test with a sample employee ID
    const sampleEmployeeId = "507f1f77bcf86cd799439011"; // Sample ObjectId

    console.log("Testing onboarding endpoint...");
    console.log(
      "URL:",
      `https://hrms-backend-vneb.onrender.com/onboarding/get-application/${sampleEmployeeId}`
    );

    const response = await axios.get(
      `https://hrms-backend-vneb.onrender.com/onboarding/get-application/${sampleEmployeeId}`,
      {
        timeout: 10000,
      }
    );

    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers);
    console.log("Response data:", JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("Error details:");
    console.error("Status:", error.response?.status);
    console.error("Status Text:", error.response?.statusText);
    console.error("Headers:", error.response?.headers);
    console.error("Data:", error.response?.data);
    console.error("Message:", error.message);
  }
}

testOnboardingEndpoint();
