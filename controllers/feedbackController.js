const mongoose = require("mongoose");
const Feedback = require("../models/Feedback");

async function createFeedback(req, res) {
  const { studentName, courseName, message, rating } = req.body || {};
  const requiredTextFields = { studentName, courseName, message };

  for (const [field, value] of Object.entries(requiredTextFields)) {
    if (typeof value !== "string" || value.trim() === "") {
      return res.status(400).json({
        success: false,
        message: `${field} is required and must not be empty`,
      });
    }
  }

  if (typeof rating !== "number" || !Number.isFinite(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: "Rating must be a number between 1 and 5",
    });
  }

  const feedback = await Feedback.create({
    studentName: studentName.trim(),
    courseName: courseName.trim(),
    message: message.trim(),
    rating,
  });

  return res.status(201).json({
    success: true,
    data: feedback,
  });
}

async function getFeedback(req, res) {
  const pageValue = req.query.page === undefined ? "1" : req.query.page;
  const limitValue = req.query.limit === undefined ? "10" : req.query.limit;
  const page = Number(pageValue);
  const limit = Number(limitValue);

  if (
    typeof pageValue !== "string" ||
    !/^[1-9]\d*$/.test(pageValue) ||
    !Number.isSafeInteger(page) ||
    typeof limitValue !== "string" ||
    !/^[1-9]\d*$/.test(limitValue) ||
    !Number.isSafeInteger(limit)
  ) {
    return res.status(400).json({
      success: false,
      message: "Page and limit must be positive integers",
    });
  }

  const skip = (page - 1) * limit;
  if (!Number.isSafeInteger(skip)) {
    return res.status(400).json({
      success: false,
      message: "The requested page and limit are too large",
    });
  }

  const [data, totalRecords] = await Promise.all([
    Feedback.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    Feedback.countDocuments(),
  ]);

  return res.status(200).json({
    success: true,
    currentPage: page,
    totalRecords,
    totalPages: Math.ceil(totalRecords / limit),
    data,
  });
}

async function updateFeedbackStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body || {};

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Feedback ID is malformed",
    });
  }

  if (status !== "Pending" && status !== "Reviewed") {
    return res.status(400).json({
      success: false,
      message: 'Status must be either "Pending" or "Reviewed"',
    });
  }

  const feedback = await Feedback.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );

  if (!feedback) {
    return res.status(404).json({
      success: false,
      message: "Feedback not found",
    });
  }

  return res.status(200).json({
    success: true,
    data: feedback,
  });
}

module.exports = { createFeedback, getFeedback, updateFeedbackStatus };
