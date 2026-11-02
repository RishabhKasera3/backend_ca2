const express = require("express");
const {
  createFeedback,
  getFeedback,
  updateFeedbackStatus,
} = require("../controllers/feedbackController");

const router = express.Router();

router.post("/", createFeedback);
router.get("/", getFeedback);
router.patch("/:id", updateFeedbackStatus);

module.exports = router;
