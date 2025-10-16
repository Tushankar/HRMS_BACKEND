# 🔧 Work Experience Save Issue - Debugging Guide

## 🎯 Issue

Cannot save work experience data to the backend.

## ✅ Fixes Applied

### Backend (`work-experience.js`):

1. ✅ Added detailed logging at every step
2. ✅ Added validation error logging
3. ✅ Added success/failure indicators
4. ✅ Added data structure logging

### Frontend (`WorkExperience.jsx`):

1. ✅ Added detailed request logging
2. ✅ Added payload inspection
3. ✅ Added response status logging
4. ✅ Added error handling logging

## 🧪 Testing Steps

### Step 1: Restart Backend Server

```bash
cd backend
# Stop the server (Ctrl+C)
# Start it again
npm start
# or
node index.js
```

### Step 2: Open Work Experience Form

1. Navigate to the Work Experience page
2. Open browser console (F12)
3. Open backend terminal

### Step 3: Fill in ONE Work Experience Entry

Fill in at least:

- Company Name: `Test Company`
- Job Title: `Software Developer`
- Employment Type: `Full-time`
- Start Date: `2020-01-01`
- End Date: `2023-12-31`

### Step 4: Click "Save as Draft"

Watch BOTH consoles:

**Frontend Console** should show:

```
💼 [WorkExperience Frontend] Save initiated with status: draft
💼 [WorkExperience Frontend] Current state:
   - employeeId: 68cd667621dec4327dd0d419
   - applicationId: 68cd668621dec4327dd0d41f
   - workExperiences count: 1
📤 [WorkExperience Frontend] Sending payload: { ... }
📥 [WorkExperience Frontend] Response status: 200
✅ [WorkExperience Frontend] Success! Response data: { ... }
```

**Backend Terminal** should show:

```
💼 [WorkExperience] Save request received
💼 Request body: { ... }
💼 Parsed data:
   - applicationId: 68cd668621dec4327dd0d41f
   - employeeId: 68cd667621dec4327dd0d419
   - workExperiences count: 1
   - status: draft
💼 [WorkExperience] Using applicationId: 68cd668621dec4327dd0d41f
🔄 [WorkExperience] Updating existing work experience
   - Old count: 0
   - New count: 1
✅ [WorkExperience] Work experience updated
🎉 [WorkExperience] Save successful!
```

## 🔍 Common Issues & Solutions

### Issue 1: 400 Bad Request - Missing employeeId

**Symptom**:

```
❌ [WorkExperience] Missing employeeId
```

**Solution**:

- Check if user is logged in
- Check localStorage for userInfo
- Verify user cookie exists

### Issue 2: 400 Bad Request - Invalid workExperiences

**Symptom**:

```
❌ [WorkExperience] Invalid workExperiences format
```

**Solution**:

- Check that workExperiences is an array
- Verify at least one experience is filled out
- Check console for payload structure

### Issue 3: 404 Not Found - Endpoint Not Found

**Symptom**:

```
POST https://hrms-backend-vneb.onrender.com/onboarding/work-experience/save 404 (Not Found)
```

**Solution**:

1. Check backend is running on port 1111
2. Verify the route is registered in `index.js`
3. Restart backend server

### Issue 4: 500 Internal Server Error

**Symptom**:

```
❌ [WorkExperience] Error saving work experience: [error message]
```

**Solution**:

- Check backend error stack trace
- Verify MongoDB is running
- Check database connection
- Verify all model fields are correct

### Issue 5: CORS Error

**Symptom**:

```
Access to fetch at 'https://hrms-backend-vneb.onrender.com/...' from origin 'http://localhost:5173' has been blocked by CORS
```

**Solution**:

- Check CORS is enabled in backend
- Verify frontend URL is whitelisted
- Restart backend server

## 📊 Expected Data Flow

### 1. Frontend Collects Data

```javascript
{
  employeeId: "68cd667621dec4327dd0d419",
  applicationId: "68cd668621dec4327dd0d41f",
  workExperiences: [{
    companyName: "Test Company",
    jobTitle: "Software Developer",
    employmentType: "Full-time",
    startDate: "2020-01-01",
    endDate: "2023-12-31",
    ...
  }],
  status: "draft"
}
```

### 2. Backend Validates & Saves

```javascript
// Finds or creates OnboardingApplication
// Finds or creates WorkExperience document
// Updates workExperiences array
// Saves to MongoDB
// Returns success response
```

### 3. Frontend Updates State

```javascript
// Sets applicationId
// Shows success alert
// Updates local state
```

## 🎯 Success Indicators

✅ Frontend shows: "Work experience saved successfully!"
✅ Backend logs: "🎉 [WorkExperience] Save successful!"
✅ Refresh page → data is still there
✅ MongoDB has document in `workexperiences` collection

## 🚨 If Still Not Working

### Check 1: Backend Route Registration

Open `backend/index.js` and verify:

```javascript
const WorkExperience = require("./routers/onboarding/work-experience.js");
app.use("/onboarding", WorkExperience);
```

### Check 2: MongoDB Connection

In backend terminal, look for:

```
MongoDB connected successfully
```

### Check 3: Model Definition

Check `backend/database/Models/WorkExperience.js` exists and is properly defined.

### Check 4: Network Tab

1. Open browser DevTools → Network tab
2. Click "Save as Draft"
3. Find the `/work-experience/save` request
4. Check:
   - Request Headers
   - Request Payload
   - Response Headers
   - Response Body

### Check 5: Environment Variables

Verify `HRMS/.env` has:

```
VITE__BASEURL=https://hrms-backend-vneb.onrender.com
```

## 📝 What to Share if Still Broken

If it's still not working, please share:

1. **Frontend Console Logs** (all lines with [WorkExperience])
2. **Backend Terminal Logs** (all lines with [WorkExperience])
3. **Network Tab** screenshot of the request/response
4. **Error Messages** (exact text)
5. **Browser** (Chrome/Firefox/etc.)
6. **OS** (Windows/Mac/Linux)

---

## 🎉 Expected Final Result

After saving, when you:

1. **Refresh the page** → Data should load back
2. **Check backend terminal** → Should see "Found saved work experiences"
3. **Check MongoDB** → Should have document in `workexperiences` collection

The comprehensive logging will show exactly where the issue is!
