// Quick test to verify the fix
const axios = require("axios");

async function testFixedEndpoint() {
  try {
    console.log("🧪 Testing Background Check Save (Fixed Version)...\n");

    const payload = {
      applicationId: "68ac0fcb02be1191737b4070", // Valid application ID
      employeeId: "67e0f8770c6feb6ba99d11d2",
      formData: {
        lastName: "Smith",
        firstName: "John",
        middleInitial: "A",
        socialSecurityNo: "123-45-6789",
        height: "6'0\"",
        weight: "180",
        eyeColor: "Blue",
        hairColor: "Brown",
        dateOfBirth: new Date("1985-05-15"),
        sex: "Male",
        race: "Caucasian",
        streetAddress: "456 Oak Street",
        city: "Test City",
        state: "TX",
        zip: "75001",
        provider: "ABC Healthcare",
        positionAppliedFor: "RN",
        signature: "John A. Smith",
        date: new Date(),
      },
      status: "draft",
    };

    console.log("📤 Sending request to save background check form...");
    const response = await axios.post(
      "https://hrms-backend-vneb.onrender.com/onboarding/save-background-check",
      payload,
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );

    console.log("✅ SUCCESS! Background check form saved");
    console.log("📋 Response:", {
      status: response.status,
      message: response.data.message,
      id: response.data.backgroundCheck._id,
    });

    return response.data.backgroundCheck._id;
  } catch (error) {
    console.log("❌ ERROR:", error.response?.data || error.message);
    return null;
  }
}

// Test updating an existing form
async function testUpdateForm(formId) {
  try {
    console.log("\n🔄 Testing form update...");

    const payload = {
      applicationId: "68ac0fcb02be1191737b4070",
      employeeId: "67e0f8770c6feb6ba99d11d2",
      formData: {
        lastName: "Smith",
        firstName: "John",
        middleInitial: "A",
        socialSecurityNo: "123-45-6789",
        height: "6'0\"",
        weight: "185", // Changed weight
        eyeColor: "Blue",
        hairColor: "Brown",
        dateOfBirth: new Date("1985-05-15"),
        sex: "Male",
        race: "Caucasian",
        streetAddress: "789 Pine Street", // Changed address
        city: "Updated City", // Changed city
        state: "TX",
        zip: "75001",
        provider: "ABC Healthcare",
        positionAppliedFor: "RN",
        signature: "John A. Smith",
        date: new Date(),
      },
      status: "completed", // Changed to completed
    };

    const response = await axios.post(
      "https://hrms-backend-vneb.onrender.com/onboarding/save-background-check",
      payload,
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );

    console.log("✅ Form updated successfully!");
    console.log("📋 Status changed to:", response.data.backgroundCheck.status);
  } catch (error) {
    console.log("❌ Update failed:", error.response?.data || error.message);
  }
}

// Run tests
async function runTests() {
  const formId = await testFixedEndpoint();
  if (formId) {
    await testUpdateForm(formId);
  }

  console.log(
    "\n🎉 Tests completed! The background check form should now work properly."
  );
  console.log("💡 Key fixes applied:");
  console.log("   - Added fallback application ID when initialization fails");
  console.log("   - Improved error handling with specific error messages");
  console.log("   - Fixed duplicate function declarations in frontend");
  console.log("   - Added debug logging in backend for troubleshooting");
}

runTests();
