const axios = require("axios");
const mongoose = require("mongoose");

// Test script specifically for physical fields (height, weight, eyeColor, hairColor)
const testPhysicalFields = async () => {
  try {
    console.log("🔍 Testing Background Check Physical Fields...\n");

    const baseURL = "https://hrms-backend-vneb.onrender.com"; // Change to your backend URL
    // const baseURL = "https://hrms-backend-vneb.onrender.com";

    // Use an existing application ID from your database
    // Replace with actual IDs from your system
    const testApplicationId = "67e0f8770c6feb6ba99d11d2"; // Replace with your actual application ID
    const testEmployeeId = "67e0f8770c6feb6ba99d11d2"; // Replace with your actual employee ID

    console.log(`📋 Using Application ID: ${testApplicationId}`);
    console.log(`👤 Using Employee ID: ${testEmployeeId}\n`);

    // Test data with PHYSICAL FIELDS
    const testFormData = {
      applicantInfo: {
        lastName: "TestUser",
        firstName: "Physical",
        middleInitial: "F",
        socialSecurityNumber: "123-45-6789",

        // ✨ THESE ARE THE CRITICAL FIELDS ✨
        height: "5'10\"",
        weight: "175 lbs",
        eyeColor: "Blue",
        hairColor: "Blonde",

        dateOfBirth: new Date("1990-05-15"),
        sex: "M",
        race: "Caucasian",
        address: {
          street: "456 Test Avenue",
          city: "Atlanta",
          state: "GA",
          zipCode: "30303",
        },
      },
      employmentInfo: {
        provider: "Test Provider Inc",
        positionAppliedFor: "QA Tester",
      },
      consentAcknowledgment: {
        consentGiven: true,
      },
      applicantSignature: "Physical TestUser",
      applicantSignatureDate: new Date(),
    };

    console.log("📝 Test data prepared with physical fields:");
    console.log("   Height:", testFormData.applicantInfo.height);
    console.log("   Weight:", testFormData.applicantInfo.weight);
    console.log("   Eye Color:", testFormData.applicantInfo.eyeColor);
    console.log("   Hair Color:", testFormData.applicantInfo.hairColor);
    console.log("");

    // STEP 1: Save the form
    console.log("💾 STEP 1: Saving background check form...");
    try {
      const saveResponse = await axios.post(
        `${baseURL}/onboarding/save-background-check`,
        {
          applicationId: testApplicationId,
          employeeId: testEmployeeId,
          formData: testFormData,
          status: "draft",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      console.log("✅ Save Response:", saveResponse.data.message);

      // Check saved data
      const savedData = saveResponse.data.backgroundCheck;
      console.log("\n🔍 Verifying saved physical fields:");
      console.log(
        "   Height:",
        savedData.applicantInfo?.height || "❌ NOT SAVED"
      );
      console.log(
        "   Weight:",
        savedData.applicantInfo?.weight || "❌ NOT SAVED"
      );
      console.log(
        "   Eye Color:",
        savedData.applicantInfo?.eyeColor || "❌ NOT SAVED"
      );
      console.log(
        "   Hair Color:",
        savedData.applicantInfo?.hairColor || "❌ NOT SAVED"
      );

      if (
        savedData.applicantInfo?.height &&
        savedData.applicantInfo?.weight &&
        savedData.applicantInfo?.eyeColor &&
        savedData.applicantInfo?.hairColor
      ) {
        console.log("\n✅ All physical fields saved successfully!");
      } else {
        console.log("\n❌ Some physical fields are missing!");
      }
    } catch (saveError) {
      console.error(
        "❌ Error saving form:",
        saveError.response?.data || saveError.message
      );
      return;
    }

    console.log("\n" + "=".repeat(70) + "\n");

    // STEP 2: Retrieve the form
    console.log("📥 STEP 2: Retrieving background check form...");
    try {
      const getResponse = await axios.get(
        `${baseURL}/onboarding/get-background-check/${testApplicationId}`,
        {
          withCredentials: true,
        }
      );

      console.log("✅ Get Response:", getResponse.data.message);

      // Check retrieved data
      const retrievedData = getResponse.data.backgroundCheck;
      console.log("\n🔍 Verifying retrieved physical fields:");
      console.log(
        "   Height:",
        retrievedData.applicantInfo?.height || "❌ NOT FOUND"
      );
      console.log(
        "   Weight:",
        retrievedData.applicantInfo?.weight || "❌ NOT FOUND"
      );
      console.log(
        "   Eye Color:",
        retrievedData.applicantInfo?.eyeColor || "❌ NOT FOUND"
      );
      console.log(
        "   Hair Color:",
        retrievedData.applicantInfo?.hairColor || "❌ NOT FOUND"
      );

      if (
        retrievedData.applicantInfo?.height &&
        retrievedData.applicantInfo?.weight &&
        retrievedData.applicantInfo?.eyeColor &&
        retrievedData.applicantInfo?.hairColor
      ) {
        console.log("\n✅ All physical fields retrieved successfully!");
      } else {
        console.log("\n❌ Some physical fields are missing after retrieval!");
      }
    } catch (getError) {
      console.error(
        "❌ Error retrieving form:",
        getError.response?.data || getError.message
      );
      return;
    }

    console.log("\n" + "=".repeat(70) + "\n");

    // STEP 3: Update with new values
    console.log("🔄 STEP 3: Updating physical fields...");
    const updatedFormData = {
      ...testFormData,
      applicantInfo: {
        ...testFormData.applicantInfo,
        height: "6'2\"", // Updated value
        weight: "190 lbs", // Updated value
        eyeColor: "Green", // Updated value
        hairColor: "Brown", // Updated value
      },
    };

    console.log("📝 New values:");
    console.log("   Height:", updatedFormData.applicantInfo.height);
    console.log("   Weight:", updatedFormData.applicantInfo.weight);
    console.log("   Eye Color:", updatedFormData.applicantInfo.eyeColor);
    console.log("   Hair Color:", updatedFormData.applicantInfo.hairColor);
    console.log("");

    try {
      const updateResponse = await axios.post(
        `${baseURL}/onboarding/save-background-check`,
        {
          applicationId: testApplicationId,
          employeeId: testEmployeeId,
          formData: updatedFormData,
          status: "completed",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      console.log("✅ Update Response:", updateResponse.data.message);

      // Check updated data
      const updatedData = updateResponse.data.backgroundCheck;
      console.log("\n🔍 Verifying updated physical fields:");
      console.log(
        "   Height:",
        updatedData.applicantInfo?.height || "❌ NOT UPDATED"
      );
      console.log(
        "   Weight:",
        updatedData.applicantInfo?.weight || "❌ NOT UPDATED"
      );
      console.log(
        "   Eye Color:",
        updatedData.applicantInfo?.eyeColor || "❌ NOT UPDATED"
      );
      console.log(
        "   Hair Color:",
        updatedData.applicantInfo?.hairColor || "❌ NOT UPDATED"
      );

      if (
        updatedData.applicantInfo?.height === "6'2\"" &&
        updatedData.applicantInfo?.weight === "190 lbs" &&
        updatedData.applicantInfo?.eyeColor === "Green" &&
        updatedData.applicantInfo?.hairColor === "Brown"
      ) {
        console.log("\n✅ All physical fields updated successfully!");
      } else {
        console.log("\n❌ Physical fields were not updated correctly!");
      }
    } catch (updateError) {
      console.error(
        "❌ Error updating form:",
        updateError.response?.data || updateError.message
      );
      return;
    }

    console.log("\n" + "=".repeat(70));
    console.log("🎉 Test completed! Check the logs above for any issues.");
    console.log("=".repeat(70) + "\n");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
  }
};

// Run the test
testPhysicalFields();
