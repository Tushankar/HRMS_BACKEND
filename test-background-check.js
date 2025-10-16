const axios = require("axios");
const mongoose = require("mongoose");

// Connect to MongoDB (using same connection as main app)
const OnboardingApplication = require("./database/Models/OnboardingApplication");
const BackgroundCheck = require("./database/Models/BackgroundCheck");

const testBackgroundCheckForm = async () => {
  try {
    console.log("Testing Background Check Form Integration...\n");

    const baseURL = "https://hrms-backend-vneb.onrender.com";

    // Create test IDs
    const testApplicationId = new mongoose.Types.ObjectId();
    const testEmployeeId = new mongoose.Types.ObjectId();

    console.log(`Using test Application ID: ${testApplicationId}`);
    console.log(`Using test Employee ID: ${testEmployeeId}\n`);

    // Connect to database and create a test application
    await mongoose.connect("mongodb://localhost:27017/HRMS");

    // Create a test onboarding application
    const testApplication = new OnboardingApplication({
      _id: testApplicationId,
      employeeId: testEmployeeId,
      applicationStatus: "in-progress",
      completedForms: [],
    });
    await testApplication.save();
    console.log("✓ Test onboarding application created\n");

    // Test data for background check form
    const testFormData = {
      lastName: "Smith",
      firstName: "John",
      middleInitial: "A",
      socialSecurityNo: "123-45-6789",
      height: "6'0\"",
      weight: "180",
      eyeColor: "Brown",
      hairColor: "Black",
      dateOfBirth: new Date("1990-01-15"),
      sex: "M",
      race: "Caucasian",
      streetAddress: "123 Main St",
      city: "Atlanta",
      state: "GA",
      zip: "30303",
      provider: "Test Provider",
      positionAppliedFor: "Software Developer",
      signature: "John A Smith",
      date: new Date(),
    };

    // Test saving the background check form
    console.log("1. Testing save-background-check endpoint...");
    const saveResponse = await axios.post(
      `${baseURL}/onboarding/save-background-check`,
      {
        applicationId: testApplicationId,
        employeeId: testEmployeeId,
        formData: testFormData,
        status: "draft",
      }
    );

    console.log("✓ Save Response:", saveResponse.data.message);
    const savedFormId = saveResponse.data.backgroundCheck._id;
    console.log(`✓ Form saved with ID: ${savedFormId}\n`);

    // Test retrieving the background check form
    console.log("2. Testing get-background-check-by-id endpoint...");
    const getResponse = await axios.get(
      `${baseURL}/onboarding/get-background-check-by-id/${savedFormId}`
    );

    console.log("✓ Get Response:", getResponse.data.message);
    console.log("✓ Form data retrieved successfully");
    console.log(
      `✓ Retrieved form for: ${getResponse.data.backgroundCheck.formData.firstName} ${getResponse.data.backgroundCheck.formData.lastName}\n`
    );

    // Test updating the form
    console.log("3. Testing form update...");
    const updatedFormData = { ...testFormData, lastName: "Johnson" };
    const updateResponse = await axios.post(
      `${baseURL}/onboarding/save-background-check`,
      {
        applicationId: testApplicationId,
        employeeId: testEmployeeId,
        formData: updatedFormData,
        status: "completed",
      }
    );

    console.log("✓ Update Response:", updateResponse.data.message);
    console.log(
      `✓ Form status updated to: ${updateResponse.data.backgroundCheck.status}\n`
    );

    // Clean up test data
    await BackgroundCheck.findByIdAndDelete(savedFormId);
    await OnboardingApplication.findByIdAndDelete(testApplicationId);
    console.log("✓ Test data cleaned up\n");

    console.log("🎉 All Background Check Form tests passed successfully!");

    // Close database connection
    await mongoose.connection.close();
  } catch (error) {
    console.error(
      "❌ Test failed:",
      error.response ? error.response.data : error.message
    );
    try {
      await mongoose.connection.close();
    } catch (closeError) {
      // Ignore close errors
    }
  }
};

// Run the test
testBackgroundCheckForm();
