# 🚀 Complete Onboarding API Testing Guide

## 📋 Overview

This document provides complete API testing instructions for the HRMS Onboarding System with **17 interactive forms** covering all PDF documents.

## 🔧 Prerequisites

- Server running on `https://hrms-backend-vneb.onrender.com`
- Employee ID: `67e0f8770c6feb6ba99d11d2`
- Thunder Client or Postman installed
- MongoDB connected

---

## 📊 1. Main Application Management

### 1.1 Get/Create Application

**Method:** `GET`  
**URL:** `https://hrms-backend-vneb.onrender.com/onboarding/get-application/67e0f8770c6feb6ba99d11d2`

**Expected Response:**

```json
{
  "message": "Onboarding application retrieved successfully",
  "data": {
    "application": {
      "_id": "APPLICATION_ID",
      "employeeId": "67e0f8770c6feb6ba99d11d2",
      "applicationStatus": "draft",
      "completionPercentage": 0,
      "completedForms": []
    },
    "forms": {
      "employmentApplication": null,
      "i9Form": null,
      "w4Form": null,
      "w9Form": null,
      "emergencyContact": null,
      "directDeposit": null,
      "misconductStatement": null,
      "codeOfEthics": null,
      "serviceDeliveryPolicy": null,
      "nonCompeteAgreement": null,
      "backgroundCheck": null,
      "tbSymptomScreen": null,
      "orientationChecklist": null,
      "jobDescriptionPCA": null,
      "jobDescriptionCNA": null,
      "jobDescriptionLPN": null,
      "jobDescriptionRN": null
    }
  }
}
```

**📝 Note:** Copy the `APPLICATION_ID` from the response for use in all subsequent requests.

---

## 📝 2. Employment Application (Exhibit 1a)

### 2.1 Save Employment Application

**Method:** `POST`  
**URL:** `https://hrms-backend-vneb.onrender.com/onboarding/save-employment-application`  
**Headers:** `Content-Type: application/json`

**Body:**

```json
{
  "applicationId": "YOUR_APPLICATION_ID",
  "employeeId": "67e0f8770c6feb6ba99d11d2",
  "formData": {
    "personalInfo": {
      "fullName": "John Doe",
      "address": {
        "street": "123 Main Street",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001"
      },
      "phoneNumber": "555-123-4567",
      "email": "john.doe@email.com",
      "dateOfBirth": "1990-01-15",
      "socialSecurityNumber": "123-45-6789",
      "emergencyContact": {
        "name": "Jane Doe",
        "relationship": "Spouse",
        "phoneNumber": "555-987-6543"
      }
    },
    "employmentInfo": {
      "positionAppliedFor": "Registered Nurse",
      "preferredShift": "Day Shift",
      "availableStartDate": "2025-09-01",
      "salaryExpected": "$65,000",
      "employmentType": "Full-time",
      "workExperience": [
        {
          "companyName": "City Hospital",
          "position": "Staff Nurse",
          "startDate": "2020-06-01",
          "endDate": "2025-07-31",
          "responsibilities": "Patient care, medication administration",
          "reasonForLeaving": "Career advancement"
        }
      ]
    },
    "education": [
      {
        "institutionName": "State University",
        "degree": "Bachelor of Science in Nursing",
        "fieldOfStudy": "Nursing",
        "graduationYear": 2020
      }
    ],
    "references": [
      {
        "name": "Dr. Smith",
        "relationship": "Former Supervisor",
        "phoneNumber": "555-111-2222",
        "email": "dr.smith@cityhospital.com"
      }
    ],
    "legalQuestions": {
      "eligibleToWork": true,
      "criminalHistory": false,
      "criminalHistoryDetails": ""
    },
    "signature": "John Doe",
    "signatureDate": "2025-08-25"
  },
  "status": "completed"
}
```

### 2.2 Get Employment Application

**Method:** `GET`  
**URL:** `https://hrms-backend-vneb.onrender.com/onboarding/get-employment-application/YOUR_APPLICATION_ID`

---

## 🆔 3. Job Description Acknowledgments (Exhibits 1a, 1b, 1c, 1d)

### 3.1 Save RN Job Description (Exhibit 1d)

**Method:** `POST`  
**URL:** `https://hrms-backend-vneb.onrender.com/onboarding/save-job-description`

**Body:**

```json
{
  "applicationId": "YOUR_APPLICATION_ID",
  "employeeId": "67e0f8770c6feb6ba99d11d2",
  "formData": {
    "jobDescriptionType": "RN",
    "jobTitle": "Registered Nurse",
    "employeeInfo": {
      "employeeName": "John Doe",
      "employeeId": "EMP001",
      "department": "Healthcare",
      "hireDate": "2025-08-25"
    },
    "jobDescriptionContent": {
      "exhibitNumber": "1d",
      "jobDescriptionTitle": "RN Job Description",
      "reviewedDate": "2025-08-25"
    },
    "acknowledgment": {
      "hasReadJobDescription": true,
      "understandsResponsibilities": true,
      "agreesToPerformDuties": true,
      "acknowledgesQualifications": true,
      "understandsReportingStructure": true
    },
    "staffSignature": {
      "signature": "John Doe",
      "date": "2025-08-25",
      "digitalSignature": true
    }
  },
  "status": "staff_signed"
}
```

### 3.2 Supervisor Sign Job Description

**Method:** `PUT`  
**URL:** `https://hrms-backend-vneb.onrender.com/onboarding/supervisor-sign-job-description/JOB_DESC_ID`

**Body:**

```json
{
  "supervisorSignature": {
    "signature": "Jane Smith",
    "supervisorName": "Jane Smith",
    "supervisorTitle": "Nursing Supervisor",
    "date": "2025-08-25",
    "digitalSignature": true
  }
}
```

### 3.3 Get Job Description by Type

**Method:** `GET`  
**URL:** `https://hrms-backend-vneb.onrender.com/onboarding/get-job-description/YOUR_APPLICATION_ID/RN`

**Other job types:** Replace `RN` with `PCA`, `CNA`, or `LPN`

---

## 📋 4. I-9 Form (Exhibit 11)

### 4.1 Save I-9 Form

**Method:** `POST`  
**URL:** `https://hrms-backend-vneb.onrender.com/onboarding/save-i9-form`

**Body:**

```json
{
  "applicationId": "YOUR_APPLICATION_ID",
  "employeeId": "67e0f8770c6feb6ba99d11d2",
  "formData": {
    "section1": {
      "lastName": "Doe",
      "firstName": "John",
      "middleInitial": "M",
      "address": {
        "street": "123 Main Street",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001"
      },
      "dateOfBirth": "1990-01-15",
      "socialSecurityNumber": "123-45-6789",
      "email": "john.doe@email.com",
      "phoneNumber": "555-123-4567",
      "citizenshipStatus": "us_citizen",
      "signatureDate": "2025-08-25"
    }
  },
  "status": "completed"
}
```

---

## 💰 5. Tax Forms

### 5.1 Save W-4 Form (Exhibit 12a)

**Method:** `POST`  
**URL:** `https://hrms-backend-vneb.onrender.com/onboarding/save-w4-form`

**Body:**

```json
{
  "applicationId": "YOUR_APPLICATION_ID",
  "employeeId": "67e0f8770c6feb6ba99d11d2",
  "formData": {
    "personalInfo": {
      "firstName": "John",
      "lastName": "Doe",
      "address": {
        "street": "123 Main Street",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001"
      },
      "socialSecurityNumber": "123-45-6789",
      "filingStatus": "single"
    },
    "multipleJobs": {
      "hasMultipleJobs": false,
      "spouseWorks": false
    },
    "dependents": {
      "numberOfDependents": 0,
      "dependentAmount": 0
    },
    "otherAdjustments": {
      "otherIncome": 0,
      "deductions": 0,
      "extraWithholding": 0
    },
    "signatureDate": "2025-08-25"
  },
  "status": "completed"
}
```

### 5.2 Save W-9 Form (Exhibit 12b)

**Method:** `POST`  
**URL:** `https://hrms-backend-vneb.onrender.com/onboarding/save-w9-form`

**Body:**

```json
{
  "applicationId": "YOUR_APPLICATION_ID",
  "employeeId": "67e0f8770c6feb6ba99d11d2",
  "formData": {
    "taxpayerInfo": {
      "name": "John Doe",
      "businessName": "",
      "federalTaxClassification": "individual",
      "address": {
        "street": "123 Main Street",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001"
      }
    },
    "taxIdNumbers": {
      "socialSecurityNumber": "123-45-6789",
      "employerIdNumber": ""
    },
    "certification": {
      "tinCorrect": true,
      "notSubjectToBackupWithholding": true,
      "usPerson": true,
      "fatcaReportingCode": ""
    },
    "signatureDate": "2025-08-25"
  },
  "status": "completed"
}
```

---

## 👥 6. Personal Information Forms

### 6.1 Save Emergency Contact (Exhibit 13)

**Method:** `POST`  
**URL:** `https://hrms-backend-vneb.onrender.com/onboarding/save-emergency-contact`

**Body:**

```json
{
  "applicationId": "YOUR_APPLICATION_ID",
  "employeeId": "67e0f8770c6feb6ba99d11d2",
  "formData": {
    "employeeInfo": {
      "fullName": "John Doe",
      "address": {
        "street": "123 Main Street",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001"
      },
      "homePhone": "555-123-4567",
      "workPhone": "555-123-4568",
      "email": "john.doe@email.com"
    },
    "primaryContact": {
      "name": "Jane Doe",
      "relationship": "Spouse",
      "address": {
        "street": "123 Main Street",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001"
      },
      "phoneNumber": "555-987-6543",
      "email": "jane.doe@email.com"
    },
    "secondaryContact": {
      "name": "Bob Smith",
      "relationship": "Friend",
      "phoneNumber": "555-111-2222"
    },
    "medicalInfo": {
      "primaryPhysician": "Dr. Johnson",
      "physicianPhone": "555-999-8888",
      "medicalConditions": "None",
      "medications": "None",
      "allergies": "None"
    }
  },
  "status": "completed"
}
```

### 6.2 Save Direct Deposit (Exhibit 14)

**Method:** `POST`  
**URL:** `https://hrms-backend-vneb.onrender.com/onboarding/save-direct-deposit`

**Body:**

```json
{
  "applicationId": "YOUR_APPLICATION_ID",
  "employeeId": "67e0f8770c6feb6ba99d11d2",
  "formData": {
    "employeeInfo": {
      "fullName": "John Doe",
      "employeeId": "EMP001",
      "socialSecurityNumber": "123-45-6789",
      "email": "john.doe@email.com"
    },
    "bankingInfo": {
      "bankName": "Chase Bank",
      "routingNumber": "021000021",
      "accountNumber": "1234567890",
      "accountType": "checking"
    },
    "depositDistribution": {
      "distributionType": "full_deposit",
      "primaryAccount": {
        "amount": 100,
        "percentage": true
      }
    },
    "authorization": {
      "authorizeDirectDeposit": true,
      "understandTerms": true,
      "signatureDate": "2025-08-25"
    }
  },
  "status": "completed"
}
```

---

## 📜 7. Policy and Legal Forms

### 7.1 Save Misconduct Statement (Exhibit 2)

**Method:** `POST`  
**URL:** `https://hrms-backend-vneb.onrender.com/onboarding/save-misconduct-statement`

**Body:**

```json
{
  "applicationId": "YOUR_APPLICATION_ID",
  "employeeId": "67e0f8770c6feb6ba99d11d2",
  "formData": {
    "staffInfo": {
      "staffTitle": "RN",
      "employeeName": "John Doe",
      "employmentPosition": "Registered Nurse"
    },
    "misconductStatement": {
      "hasBeenConvicted": false,
      "convictionDetails": "",
      "hasPendingCharges": false,
      "pendingChargesDetails": "",
      "hasBeenSanctioned": false,
      "sanctionDetails": "",
      "understandsResponsibilities": true,
      "agreesToReportChanges": true
    },
    "acknowledgment": {
      "understandsConsequences": true,
      "providedTruthfulInformation": true,
      "agreesToBackgroundCheck": true,
      "signatureDate": "2025-08-25"
    }
  },
  "status": "completed"
}
```

### 7.2 Save Code of Ethics (Exhibit 3)

**Method:** `POST`  
**URL:** `https://hrms-backend-vneb.onrender.com/onboarding/save-code-of-ethics`

**Body:**

```json
{
  "applicationId": "YOUR_APPLICATION_ID",
  "employeeId": "67e0f8770c6feb6ba99d11d2",
  "formData": {
    "employeeInfo": {
      "employeeName": "John Doe",
      "position": "Registered Nurse",
      "department": "Healthcare",
      "startDate": "2025-08-25"
    },
    "ethicsAcknowledgment": {
      "noPersonalUseOfClientCar": true,
      "noConsumingClientFood": true,
      "noPersonalPhoneCalls": true,
      "noPoliticalReligiousDiscussions": true,
      "professionalAppearance": true,
      "respectfulTreatment": true,
      "confidentialityMaintained": true,
      "reportSafetyConcerns": true,
      "followCompanyPolicies": true
    },
    "agreement": {
      "readAndUnderstood": true,
      "agreeToComply": true,
      "understandConsequences": true,
      "willingToSeekGuidance": true,
      "signatureDate": "2025-08-25"
    }
  },
  "status": "completed"
}
```

### 7.3 Save Service Delivery Policy (Exhibit 4)

**Method:** `POST`  
**URL:** `https://hrms-backend-vneb.onrender.com/onboarding/save-service-delivery-policy`

**Body:**

```json
{
  "applicationId": "YOUR_APPLICATION_ID",
  "employeeId": "67e0f8770c6feb6ba99d11d2",
  "formData": {
    "employeeInfo": {
      "employeeName": "John Doe",
      "position": "Registered Nurse",
      "department": "Healthcare",
      "hireDate": "2025-08-25"
    },
    "policyAcknowledgments": {
      "clientCare": {
        "respectClientDignity": true,
        "maintainClientConfidentiality": true,
        "provideQualityService": true,
        "followCarePlans": true
      },
      "safety": {
        "followSafetyProtocols": true,
        "usePersonalProtectiveEquipment": true,
        "reportIncidents": true,
        "maintainCleanEnvironment": true
      },
      "documentation": {
        "accurateDocumentation": true,
        "timelyDocumentation": true,
        "secureRecordKeeping": true
      },
      "communication": {
        "professionalCommunication": true,
        "promptResponseToSupervisors": true,
        "respectfulInteraction": true
      }
    },
    "agreement": {
      "readPolicies": true,
      "understoodPolicies": true,
      "agreeToComply": true,
      "signatureDate": "2025-08-25"
    }
  },
  "status": "completed"
}
```

### 7.4 Save Non-Compete Agreement (Exhibit 5)

**Method:** `POST`  
**URL:** `https://hrms-backend-vneb.onrender.com/onboarding/save-non-compete-agreement`

**Body:**

```json
{
  "applicationId": "YOUR_APPLICATION_ID",
  "employeeId": "67e0f8770c6feb6ba99d11d2",
  "formData": {
    "employeeInfo": {
      "employeeName": "John Doe",
      "position": "Registered Nurse",
      "startDate": "2025-08-25",
      "address": {
        "street": "123 Main Street",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001"
      }
    },
    "nonCompeteTerms": {
      "restrictionPeriod": 12,
      "geographicScope": "50 mile radius",
      "industryScope": "Healthcare services"
    },
    "confidentialityTerms": {
      "protectTradeSecrets": true,
      "protectClientInformation": true,
      "returnCompanyProperty": true,
      "noSolicitationOfClients": true
    },
    "acknowledgments": {
      "readAgreement": true,
      "understoodTerms": true,
      "agreeToTerms": true,
      "receivedConsideration": true,
      "signatureDate": "2025-08-25"
    }
  },
  "status": "completed"
}
```

---

## 🔍 8. Screening Forms

### 8.1 Save Background Check (Exhibit 7)

**Method:** `POST`  
**URL:** `https://hrms-backend-vneb.onrender.com/onboarding/save-background-check`

**Body:**

```json
{
  "applicationId": "YOUR_APPLICATION_ID",
  "employeeId": "67e0f8770c6feb6ba99d11d2",
  "formData": {
    "employeeInfo": {
      "fullName": "John Doe",
      "dateOfBirth": "1990-01-15",
      "socialSecurityNumber": "123-45-6789",
      "driversLicenseNumber": "D1234567890",
      "driversLicenseState": "NY",
      "currentAddress": {
        "street": "123 Main Street",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001"
      },
      "phoneNumber": "555-123-4567",
      "email": "john.doe@email.com"
    },
    "previousAddresses": [
      {
        "street": "456 Old Street",
        "city": "Boston",
        "state": "MA",
        "zipCode": "02101",
        "fromDate": "2015-01-01",
        "toDate": "2020-12-31"
      }
    ],
    "authorization": {
      "authorizeBackgroundCheck": true,
      "authorizeContactEmployers": true,
      "understoodRights": true,
      "providedAccurateInfo": true,
      "signatureDate": "2025-08-25"
    }
  },
  "status": "completed"
}
```

### 8.2 Save TB Symptom Screen (Exhibit 9)

**Method:** `POST`  
**URL:** `https://hrms-backend-vneb.onrender.com/onboarding/save-tb-symptom-screen`

**Body:**

```json
{
  "applicationId": "YOUR_APPLICATION_ID",
  "employeeId": "67e0f8770c6feb6ba99d11d2",
  "formData": {
    "employeeInfo": {
      "fullName": "John Doe",
      "dateOfBirth": "1990-01-15",
      "employeeId": "EMP001",
      "department": "Healthcare",
      "position": "Registered Nurse"
    },
    "symptoms": {
      "persistentCough": false,
      "bloodInSputum": false,
      "unexplainedWeightLoss": false,
      "nightSweats": false,
      "fever": false,
      "fatigue": false,
      "chestPain": false
    },
    "riskFactors": {
      "closeContactWithTB": false,
      "travelToHighRiskAreas": false,
      "immunocompromised": false,
      "diabetes": false,
      "substanceUse": false
    },
    "certification": {
      "answeredTruthfully": true,
      "understandImportance": true,
      "agreeToFollowUp": true,
      "screeningDate": "2025-08-25"
    }
  },
  "status": "completed"
}
```

### 8.3 Save Orientation Checklist (Exhibit 6b)

**Method:** `POST`  
**URL:** `https://hrms-backend-vneb.onrender.com/onboarding/save-orientation-checklist`

**Body:**

```json
{
  "applicationId": "YOUR_APPLICATION_ID",
  "employeeId": "67e0f8770c6feb6ba99d11d2",
  "formData": {
    "employeeInfo": {
      "fullName": "John Doe",
      "position": "Registered Nurse",
      "department": "Healthcare",
      "startDate": "2025-08-25",
      "supervisor": "Jane Smith"
    },
    "companyOverview": {
      "companyHistoryPresented": true,
      "missionVisionValues": true,
      "organizationalChart": true,
      "companyPolicies": true
    },
    "jobSpecificOrientation": {
      "jobDescriptionReviewed": true,
      "rolesResponsibilities": true,
      "performanceExpectations": true,
      "workSchedule": true
    },
    "safetyAndSecurity": {
      "emergencyProcedures": true,
      "safetyTraining": true,
      "securityProtocols": true,
      "equipmentTraining": true
    },
    "systemsAndProcedures": {
      "computersAndSoftware": true,
      "communicationSystems": true,
      "documentationProcedures": true
    }
  },
  "status": "completed"
}
```

---

## 📤 9. Application Submission & HR Functions

### 9.1 Submit Application to HR

**Method:** `PUT`  
**URL:** `https://hrms-backend-vneb.onrender.com/onboarding/submit-application/YOUR_APPLICATION_ID`

### 9.2 Get All Applications (HR View)

**Method:** `GET`  
**URL:** `https://hrms-backend-vneb.onrender.com/onboarding/get-all-applications`

### 9.3 Update Application Status (HR)

**Method:** `PUT`  
**URL:** `https://hrms-backend-vneb.onrender.com/onboarding/update-status/YOUR_APPLICATION_ID`

**Body:**

```json
{
  "status": "under_review",
  "reviewComments": "Application under review",
  "reviewedBy": "67e0f8770c6feb6ba99d11d2"
}
```

**Status Options:** `draft`, `submitted`, `under_review`, `approved`, `rejected`

---

## 📊 10. Progress Tracking

After completing each form, check the progress:

**Method:** `GET`  
**URL:** `https://hrms-backend-vneb.onrender.com/onboarding/get-application/67e0f8770c6feb6ba99d11d2`

**Completion Percentage Calculation:**

- Total Forms: **17**
- Each completed form: **~5.88%** increase
- All forms completed: **100%**

---

## ✅ 11. Testing Checklist

### Core Functionality Tests:

- [ ] Create/Get application
- [ ] Save each form as draft
- [ ] Complete each form
- [ ] Check completion percentage increases
- [ ] Submit application to HR
- [ ] Update application status

### Form-Specific Tests:

- [ ] Employment Application (1a)
- [ ] Job Description PCA (1a)
- [ ] Job Description CNA (1b)
- [ ] Job Description LPN (1c)
- [ ] Job Description RN (1d)
- [ ] Staff Misconduct Statement (2)
- [ ] Code of Ethics (3)
- [ ] Service Delivery Policy (4)
- [ ] Non-Compete Agreement (5)
- [ ] Orientation Checklist (6b)
- [ ] Background Check (7)
- [ ] TB Symptom Screen (9)
- [ ] I-9 Form (11)
- [ ] W-4 Form (12a)
- [ ] W-9 Form (12b)
- [ ] Emergency Contact (13)
- [ ] Direct Deposit (14)

### Success Criteria:

- ✅ All 17 forms save successfully
- ✅ Draft functionality works
- ✅ Completion percentage updates correctly
- ✅ Application submission works
- ✅ HR functions work (view, update status)
- ✅ All forms appear in main application response

---

## 🐛 Common Issues & Solutions

### Issue: "Application not found"

**Solution:** Make sure to use the correct APPLICATION_ID from step 1

### Issue: Forms not appearing in main response

**Solution:** Server restart required after schema updates

### Issue: Completion percentage not updating

**Solution:** Ensure `status: "completed"` is set in form data

### Issue: Server connection errors

**Solution:** Verify server is running on port 1111

---

## 🎉 Expected Final Result

After completing all 17 forms, your application should show:

- `completionPercentage: 100`
- `applicationStatus: "submitted"`
- All form fields populated in the response
- 17 entries in `completedForms` array

**🚀 Your onboarding system is now fully functional and ready for production use!**
