# Complete Onboarding Forms Testing Guide

## 🧪 How to Test All 18 Onboarding Forms

### Prerequisites

- Backend server running on `https://hrms-backend-vneb.onrender.com`
- MongoDB connected
- Testing tool: **Postman**, **Thunder Client**, or **curl**

---

## 📋 Complete Forms List (18 Forms)

### Required Forms (8):

1. ✅ Employment Application
2. ✅ I-9 Form
3. ✅ W-4 Form
4. ✅ Emergency Contact
5. ✅ Staff Statement of Misconduct
6. ✅ Code of Ethics
7. ✅ Background Check Form
8. ✅ TB Symptom Screen

### Optional Forms (5):

9. ✅ W-9 Form
10. ✅ Direct Deposit
11. ✅ Service Delivery Policies
12. ✅ Non-Compete Agreement
13. ✅ Orientation Checklist

### Reference Documents (5):

14. ℹ️ PCA Job Description (Reference only)
15. ℹ️ CNA Job Description (Reference only)
16. ℹ️ LPN Job Description (Reference only)
17. ℹ️ RN Job Description (Reference only)
18. ℹ️ Orientation Training Presentation (Reference only)

**Total Interactive Forms: 13 Forms with APIs**
**Total Reference Documents: 5 (No APIs needed)**

---

## 🚀 Quick Testing Steps

### Step 1: Test Server Connection

```bash
curl https://hrms-backend-vneb.onrender.com/onboarding/get-all-applications
```

### Step 2: Create Test Employee (if needed)

First, you need a valid employee ID from your existing users table.

### Step 3: Test Each Form Systematically

---

## 📝 Detailed API Testing Scripts

### 1. Test Main Application Flow

#### Create/Get Onboarding Application

```bash
# Replace EMPLOYEE_ID with actual employee ID
curl -X GET https://hrms-backend-vneb.onrender.com/onboarding/get-application/EMPLOYEE_ID
```

### 2. Test All 13 Interactive Forms

#### Form 1: Employment Application

```bash
# Save as Draft
curl -X POST https://hrms-backend-vneb.onrender.com/onboarding/save-employment-application \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": "APPLICATION_ID_HERE",
    "employeeId": "EMPLOYEE_ID_HERE",
    "formData": {
      "personalInfo": {
        "fullName": "John Doe",
        "address": {
          "street": "123 Main St",
          "city": "Anytown",
          "state": "CA",
          "zipCode": "12345"
        },
        "phoneNumber": "555-1234",
        "email": "john.doe@email.com"
      }
    },
    "status": "draft"
  }'

# Get Employment Application
curl -X GET https://hrms-backend-vneb.onrender.com/onboarding/get-employment-application/APPLICATION_ID
```

#### Form 2: I-9 Form

```bash
# Save I-9 Form
curl -X POST https://hrms-backend-vneb.onrender.com/onboarding/save-i9-form \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": "APPLICATION_ID_HERE",
    "employeeId": "EMPLOYEE_ID_HERE",
    "formData": {
      "section1": {
        "lastName": "Doe",
        "firstName": "John",
        "citizenshipStatus": "us_citizen"
      }
    },
    "status": "draft"
  }'

# Get I-9 Form
curl -X GET https://hrms-backend-vneb.onrender.com/onboarding/get-i9-form/APPLICATION_ID
```

#### Form 3: W-4 Form

```bash
# Save W-4 Form
curl -X POST https://hrms-backend-vneb.onrender.com/onboarding/save-w4-form \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": "APPLICATION_ID_HERE",
    "employeeId": "EMPLOYEE_ID_HERE",
    "formData": {
      "personalInfo": {
        "firstName": "John",
        "lastName": "Doe",
        "filingStatus": "single"
      }
    },
    "status": "draft"
  }'

# Get W-4 Form
curl -X GET https://hrms-backend-vneb.onrender.com/onboarding/get-w4-form/APPLICATION_ID
```

#### Form 4: W-9 Form

```bash
# Save W-9 Form
curl -X POST https://hrms-backend-vneb.onrender.com/onboarding/save-w9-form \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": "APPLICATION_ID_HERE",
    "employeeId": "EMPLOYEE_ID_HERE",
    "formData": {
      "taxpayerInfo": {
        "name": "John Doe",
        "federalTaxClassification": "individual"
      }
    },
    "status": "draft"
  }'

# Get W-9 Form
curl -X GET https://hrms-backend-vneb.onrender.com/onboarding/get-w9-form/APPLICATION_ID
```

#### Form 5: Emergency Contact

```bash
# Save Emergency Contact
curl -X POST https://hrms-backend-vneb.onrender.com/onboarding/save-emergency-contact \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": "APPLICATION_ID_HERE",
    "employeeId": "EMPLOYEE_ID_HERE",
    "formData": {
      "employeeInfo": {
        "fullName": "John Doe"
      },
      "primaryContact": {
        "name": "Jane Doe",
        "relationship": "Spouse",
        "phoneNumber": "555-5678"
      }
    },
    "status": "draft"
  }'

# Get Emergency Contact
curl -X GET https://hrms-backend-vneb.onrender.com/onboarding/get-emergency-contact/APPLICATION_ID
```

#### Form 6: Direct Deposit

```bash
# Save Direct Deposit
curl -X POST https://hrms-backend-vneb.onrender.com/onboarding/save-direct-deposit \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": "APPLICATION_ID_HERE",
    "employeeId": "EMPLOYEE_ID_HERE",
    "formData": {
      "employeeInfo": {
        "fullName": "John Doe"
      },
      "bankingInfo": {
        "bankName": "Test Bank",
        "routingNumber": "123456789",
        "accountNumber": "987654321",
        "accountType": "checking"
      }
    },
    "status": "draft"
  }'

# Get Direct Deposit
curl -X GET https://hrms-backend-vneb.onrender.com/onboarding/get-direct-deposit/APPLICATION_ID
```

#### Form 7: Misconduct Statement

```bash
# Save Misconduct Statement
curl -X POST https://hrms-backend-vneb.onrender.com/onboarding/save-misconduct-statement \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": "APPLICATION_ID_HERE",
    "employeeId": "EMPLOYEE_ID_HERE",
    "formData": {
      "staffInfo": {
        "employeeName": "John Doe",
        "employmentPosition": "Nurse"
      },
      "misconductStatement": {
        "hasBeenConvicted": false,
        "hasPendingCharges": false
      }
    },
    "status": "draft"
  }'

# Get Misconduct Statement
curl -X GET https://hrms-backend-vneb.onrender.com/onboarding/get-misconduct-statement/APPLICATION_ID
```

#### Form 8: Code of Ethics

```bash
# Save Code of Ethics
curl -X POST https://hrms-backend-vneb.onrender.com/onboarding/save-code-of-ethics \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": "APPLICATION_ID_HERE",
    "employeeId": "EMPLOYEE_ID_HERE",
    "formData": {
      "employeeInfo": {
        "employeeName": "John Doe",
        "position": "Nurse"
      },
      "ethicsAcknowledgment": {
        "noPersonalUseOfClientCar": true,
        "noConsumingClientFood": true,
        "professionalAppearance": true
      }
    },
    "status": "draft"
  }'

# Get Code of Ethics
curl -X GET https://hrms-backend-vneb.onrender.com/onboarding/get-code-of-ethics/APPLICATION_ID
```

#### Form 9: Service Delivery Policy

```bash
# Save Service Delivery Policy
curl -X POST https://hrms-backend-vneb.onrender.com/onboarding/save-service-delivery-policy \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": "APPLICATION_ID_HERE",
    "employeeId": "EMPLOYEE_ID_HERE",
    "formData": {
      "employeeInfo": {
        "employeeName": "John Doe",
        "position": "Nurse"
      },
      "policyAcknowledgments": {
        "clientCare": {
          "respectClientDignity": true,
          "maintainClientConfidentiality": true
        }
      }
    },
    "status": "draft"
  }'

# Get Service Delivery Policy
curl -X GET https://hrms-backend-vneb.onrender.com/onboarding/get-service-delivery-policy/APPLICATION_ID
```

#### Form 10: Non-Compete Agreement

```bash
# Save Non-Compete Agreement
curl -X POST https://hrms-backend-vneb.onrender.com/onboarding/save-non-compete-agreement \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": "APPLICATION_ID_HERE",
    "employeeId": "EMPLOYEE_ID_HERE",
    "formData": {
      "employeeInfo": {
        "employeeName": "John Doe",
        "position": "Nurse"
      },
      "nonCompeteTerms": {
        "restrictionPeriod": 12,
        "geographicScope": "50 miles"
      }
    },
    "status": "draft"
  }'

# Get Non-Compete Agreement
curl -X GET https://hrms-backend-vneb.onrender.com/onboarding/get-non-compete-agreement/APPLICATION_ID
```

#### Form 11: Background Check

```bash
# Save Background Check
curl -X POST https://hrms-backend-vneb.onrender.com/onboarding/save-background-check \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": "APPLICATION_ID_HERE",
    "employeeId": "EMPLOYEE_ID_HERE",
    "formData": {
      "employeeInfo": {
        "fullName": "John Doe",
        "socialSecurityNumber": "123-45-6789"
      },
      "authorization": {
        "authorizeBackgroundCheck": true
      }
    },
    "status": "draft"
  }'

# Get Background Check
curl -X GET https://hrms-backend-vneb.onrender.com/onboarding/get-background-check/APPLICATION_ID
```

#### Form 12: TB Symptom Screen

```bash
# Save TB Symptom Screen
curl -X POST https://hrms-backend-vneb.onrender.com/onboarding/save-tb-symptom-screen \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": "APPLICATION_ID_HERE",
    "employeeId": "EMPLOYEE_ID_HERE",
    "formData": {
      "employeeInfo": {
        "fullName": "John Doe",
        "position": "Nurse"
      },
      "symptoms": {
        "persistentCough": false,
        "bloodInSputum": false,
        "unexplainedWeightLoss": false
      }
    },
    "status": "draft"
  }'

# Get TB Symptom Screen
curl -X GET https://hrms-backend-vneb.onrender.com/onboarding/get-tb-symptom-screen/APPLICATION_ID
```

#### Form 13: Orientation Checklist

```bash
# Save Orientation Checklist
curl -X POST https://hrms-backend-vneb.onrender.com/onboarding/save-orientation-checklist \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": "APPLICATION_ID_HERE",
    "employeeId": "EMPLOYEE_ID_HERE",
    "formData": {
      "employeeInfo": {
        "fullName": "John Doe",
        "position": "Nurse"
      },
      "companyOverview": {
        "companyHistoryPresented": true,
        "missionVisionValues": true
      }
    },
    "status": "draft"
  }'

# Get Orientation Checklist
curl -X GET https://hrms-backend-vneb.onrender.com/onboarding/get-orientation-checklist/APPLICATION_ID
```

---

## 🎯 Advanced Testing

### Test Application Submission

```bash
# Submit Application to HR
curl -X PUT https://hrms-backend-vneb.onrender.com/onboarding/submit-application/APPLICATION_ID
```

### Test HR Functions

```bash
# Update Application Status (HR)
curl -X PUT https://hrms-backend-vneb.onrender.com/onboarding/update-status/APPLICATION_ID \
  -H "Content-Type: application/json" \
  -d '{
    "status": "under_review",
    "reviewComments": "Initial review in progress",
    "reviewedBy": "HR_USER_ID"
  }'

# Get All Applications (HR View)
curl -X GET https://hrms-backend-vneb.onrender.com/onboarding/get-all-applications
```

---

## ⚡ Automated Testing Script

Create a file called `test-all-forms.js`:

```javascript
const axios = require("axios");

const BASE_URL = "https://hrms-backend-vneb.onrender.com/onboarding";
const EMPLOYEE_ID = "YOUR_EMPLOYEE_ID_HERE"; // Replace with actual employee ID

async function testAllForms() {
  try {
    console.log("🧪 Starting comprehensive onboarding forms test...\n");

    // Step 1: Create/Get Application
    console.log("1. Creating onboarding application...");
    const appResponse = await axios.get(
      `${BASE_URL}/get-application/${EMPLOYEE_ID}`
    );
    const APPLICATION_ID = appResponse.data.data.application._id;
    console.log("✅ Application created:", APPLICATION_ID);

    // Step 2: Test all forms
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
      console.log(`${i + 2}. Testing ${formName}...`);

      try {
        // Save form
        await axios.post(`${BASE_URL}/save-${formName}`, {
          applicationId: APPLICATION_ID,
          employeeId: EMPLOYEE_ID,
          formData: { test: "data" },
          status: "draft",
        });

        // Get form
        await axios.get(`${BASE_URL}/get-${formName}/${APPLICATION_ID}`);
        console.log(`✅ ${formName} - PASSED`);
      } catch (error) {
        console.log(
          `❌ ${formName} - FAILED:`,
          error.response?.data?.message || error.message
        );
      }
    }

    console.log("\n🎉 Testing complete!");
  } catch (error) {
    console.error(
      "❌ Test failed:",
      error.response?.data?.message || error.message
    );
  }
}

testAllForms();
```

Run with: `node test-all-forms.js`

---

## 📊 Expected Results Checklist

For each form, you should see:

- ✅ `200 OK` status for POST requests (save)
- ✅ `200 OK` status for GET requests (retrieve)
- ✅ Form data properly saved in database
- ✅ Progress tracking updated
- ✅ Proper error messages for invalid data

### Success Indicators:

1. **Server Response**: HTTP 200 status codes
2. **Data Persistence**: Forms saved and retrievable
3. **Progress Updates**: Completion percentage changes
4. **Validation**: Proper error handling for missing fields
5. **HR Workflow**: Application submission and status updates work

---

## 🐛 Troubleshooting

### Common Issues:

1. **404 Error**: Check if route is properly registered
2. **500 Error**: Check server logs for database connection issues
3. **400 Error**: Check required fields in request body
4. **Connection Refused**: Ensure server is running on port 1111

### Debug Commands:

```bash
# Check server status
curl https://hrms-backend-vneb.onrender.com/

# Check if MongoDB is connected
# Look for "Database Connected Successfully" in server logs

# Test basic route
curl https://hrms-backend-vneb.onrender.com/onboarding/get-all-applications
```

This comprehensive testing guide will help you verify that all 13 interactive onboarding forms are working correctly!
