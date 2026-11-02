require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const feedbackRoutes = require("./routes/feedbackRoutes");

const app = express();
const PORT = Number(process.env.PORT) || 8000;

app.use(express.json());
app.use("/api/feedback", feedbackRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({
      success: false,
      message: "Request body contains invalid JSON",
    });
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  console.error(error);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Student Feedback Management API listening on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exitCode = 1;
});
