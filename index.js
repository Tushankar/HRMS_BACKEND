require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const connectDB = require("./database/conn");
const http = require("http");
const WebSocket = require("ws");
const Message = require("./database/Models/Message.js"); // Import Message Model

const PORT = 1111;
const app = express();
connectDB();

// Create HTTP Server & WebSocket Server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Make wss globally accessible for routes
global.wss = wss;

// Enhanced CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
      "https://cool-malabi-d4598b.netlify.app",
      "https://meek-fox-fdb3c3.netlify.app",
      "https://hrmsmanagement.netlify.app",
    ], // Include both frontend ports and production URL
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allow all standard methods
    allowedHeaders: ["Content-Type", "Authorization", "Accept"], // Allow common headers
    exposedHeaders: ["Authorization"], // Expose headers if needed
    credentials: true, // Allow cookies and authorization headers
  })
);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(morgan("combined"));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Import Routes
const RegisterRoute = require("./routers/auth/Register.js");
const LoginRoute = require("./routers/auth/Login.js");
const CreateTask = require("./routers/hr/create-task.js");
const GetTasks = require("./routers/hr/get-task.js");
const GetAllEmployee = require("./routers/employee/getAllEmployee.js");
const UpdateTask = require("./routers/hr/updateTask.js");
const UploadFile = require("./routers/employee/uploadFile.js");
const CreateEmployee = require("./routers/hr/create-employee.js");
const UploadSignature = require("./routers/employee/uploadSignature.js");
const UpdateProfile = require("./routers/employee/update-profile.js");
const Getchat = require("./routers/chat/getChatHistory.js");
const UploadRouter = require("./routers/upload.js");

// Onboarding Routes
const OnboardingMain = require("./routers/onboarding/onboarding-main.js");
const EmploymentApplication = require("./routers/onboarding/employment-application.js");
const I9Form = require("./routers/onboarding/i9-form.js");
const TaxForms = require("./routers/onboarding/tax-forms.js");
const PersonalForms = require("./routers/onboarding/personal-forms.js");
const PolicyForms = require("./routers/onboarding/policy-forms.js");
const ScreeningForms = require("./routers/onboarding/screening-forms.js");
const JobDescription = require("./routers/onboarding/job-description.js");
const WorkExperience = require("./routers/onboarding/work-experience.js");
const Education = require("./routers/onboarding/education.js");
const References = require("./routers/onboarding/references.js");
const LegalDisclosures = require("./routers/onboarding/legal-disclosures.js");
const PositionType = require("./routers/onboarding/position-type.js");
const OrientationPresentation = require("./routers/onboarding/orientation-presentation.js");
const PCATrainingQuestions = require("./routers/onboarding/pcaTrainingQuestions.js");
const TrainingVideo = require("./routers/onboarding/trainingVideo.js");
const MisconductStatement = require("./routers/onboarding/misconduct-statement.js");

// HR Review Routes
const OnboardingReview = require("./routers/hr/onboarding-review.js");
const OnboardingManagement = require("./routers/hr/onboarding-management.js");

// Kanban Task Management Routes
const KanbanTasks = require("./routers/hr/kanban-tasks.js");

// Apply Routes
app.use("/auth", RegisterRoute);
app.use("/auth", LoginRoute);
app.use("/task", CreateTask);
app.use("/task", GetTasks);
app.use("/task", UpdateTask);
app.use("/employee", GetAllEmployee);
app.use("/employee", UpdateProfile);
app.use("/doc", UploadFile);
app.use("/hr", CreateEmployee);
app.use("/signature", UploadSignature);
app.use("/chat", Getchat);
app.use("/upload", UploadRouter);

// Apply Onboarding Routes
app.use("/onboarding", OnboardingMain);
app.use("/onboarding", EmploymentApplication);
app.use("/onboarding", I9Form);
app.use("/onboarding", TaxForms);
app.use("/onboarding", PersonalForms);
app.use("/onboarding", PolicyForms);
app.use("/onboarding", ScreeningForms);
app.use("/onboarding", JobDescription);
app.use("/onboarding", WorkExperience);
app.use("/onboarding", Education);
app.use("/onboarding", References);
app.use("/onboarding", LegalDisclosures);
app.use("/onboarding", PositionType);
app.use("/onboarding", OrientationPresentation);
app.use("/onboarding/pca-training", PCATrainingQuestions);
app.use("/onboarding/training-video", TrainingVideo);
app.use("/onboarding/misconduct-statement", MisconductStatement);

// Direct job description route (for simplified API)
app.use("/job-description", JobDescription);

// Apply HR Review Routes
app.use("/hr/onboarding", OnboardingReview);
app.use("/hr", OnboardingManagement);

// Apply Kanban Task Management Routes
app.use("/hr/kanban", KanbanTasks);

// WebSocket for Real-Time Chat
const users = {}; // Store connected users { userId: WebSocket }

wss.on("connection", (ws) => {
  console.log("New WebSocket Connection");

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);
      const {
        event,
        senderId,
        receiverId,
        content,
        offer,
        answer,
        candidate,
        messageId,
      } = data;

      if (event === "login") {
        if (!senderId) {
          console.error("Login failed: No senderId provided", data);
          ws.send(
            JSON.stringify({ event: "login-error", message: "Invalid user ID" })
          );
          return;
        }
        users[senderId] = ws;
        console.log(`User ${senderId} connected`);
        console.log("Current users:", Object.keys(users));
        ws.send(JSON.stringify({ event: "login-success", senderId }));
      } else if (event === "message") {
        if (!senderId || !receiverId || !content) {
          console.error("Invalid message data:", data);
          return;
        }
        const newMessage = new Message({
          sender: senderId,
          receiver: receiverId,
          content,
        });
        await newMessage.save();

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({ event: "message", ...newMessage.toObject() })
            );
          }
        });
      } else if (event === "mark-read") {
        if (!messageId || !receiverId) {
          console.error("Invalid mark-read data:", data);
          return;
        }
        const message = await Message.findById(messageId);
        if (!message) {
          console.error(`Message ${messageId} not found`);
          return;
        }
        if (
          message.receiver.toString() === receiverId &&
          message.status !== "read"
        ) {
          message.status = "read";
          await message.save();
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({
                  event: "message-updated",
                  ...message.toObject(),
                })
              );
            }
          });
        }
      } else if (event === "call") {
        console.log(
          "Processing call event. Sender:",
          senderId,
          "Receiver:",
          receiverId
        );
        console.log("Current users:", Object.keys(users));
        if (users[receiverId]) {
          users[receiverId].send(
            JSON.stringify({
              event: "incoming-call",
              senderId,
              offer,
            })
          );
        } else {
          console.error(`Receiver ${receiverId} not found in users`);
          ws.send(
            JSON.stringify({
              event: "call-error",
              message: "User not connected",
            })
          );
        }
      } else if (event === "answer") {
        if (users[receiverId]) {
          users[receiverId].send(
            JSON.stringify({
              event: "call-answer",
              senderId,
              answer,
            })
          );
        } else {
          console.error(`Receiver ${receiverId} not found for answer`);
        }
      } else if (event === "ice-candidate") {
        if (users[receiverId]) {
          users[receiverId].send(
            JSON.stringify({
              event: "ice-candidate",
              senderId,
              candidate,
            })
          );
        }
      } else if (event === "end-call") {
        if (users[receiverId]) {
          users[receiverId].send(
            JSON.stringify({
              event: "end-call",
              senderId,
            })
          );
        }
      }
    } catch (error) {
      console.error("WebSocket Error:", error);
    }
  });

  ws.on("close", () => {
    Object.keys(users).forEach((userId) => {
      if (users[userId] === ws) {
        delete users[userId];
        console.log(`User ${userId} disconnected`);
        console.log("Current users:", Object.keys(users));
      }
    });
  });
});

// ✅ Use `server.listen()` instead of `app.listen()`
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
