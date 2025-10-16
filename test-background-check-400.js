const axios = require("axios");

// Test the background check endpoint with the exact payload from frontend
async function testBackgroundCheck() {
  try {
    console.log("Testing Background Check Save API...\n");

    // This mimics the exact payload sent from the frontend
    const payload = {
      applicationId: "68ac0fcb02be1191737b4070", // Valid application ID from database
      employeeId: "67e0f8770c6feb6ba99d11d2", // Valid ObjectId for development
      formData: {
        lastName: "Test",
        firstName: "User",
        middleInitial: "A",
        socialSecurityNo: "123-45-6789",
        height: "5'10\"",
        weight: "170",
        eyeColor: "Brown",
        hairColor: "Black",
        dateOfBirth: new Date("1990-01-01"),
        sex: "Male",
        race: "White",
        streetAddress: "123 Main St",
        city: "Test City",
        state: "CA",
        zip: "12345",
        provider: "Test Provider",
        positionAppliedFor: "CNA",
        signature: "Test Signature",
        date: new Date(),
      },
      status: "draft",
    };

    console.log("Payload being sent:");
    console.log(JSON.stringify(payload, null, 2));
    console.log("\n---\n");

    const response = await axios.post(
      "https://hrms-backend-vneb.onrender.com/onboarding/save-background-check",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    console.log("✅ Success! Response:");
    console.log("Status:", response.status);
    console.log("Data:", response.data);
  } catch (error) {
    console.log("❌ Error occurred:");
    console.log("Status:", error.response?.status);
    console.log("Status Text:", error.response?.statusText);
    console.log("Error Message:", error.message);
    console.log("Response Data:", error.response?.data);

    if (error.response?.status === 400) {
      console.log("\n🔍 This is the 400 error you're seeing!");
      console.log("Response headers:", error.response.headers);
    }
  }
}

testBackgroundCheck();
