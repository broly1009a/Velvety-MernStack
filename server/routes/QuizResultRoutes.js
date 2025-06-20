const express = require("express");
const {
  saveQuizResult,
  getAllResults,
  getUserResults,
  deleteQuizResult,
} = require("../controllers/QuizResultController");
const { authenticate, authorize } = require("../middlewares/AuthMiddleware");

const router = express.Router();

router.post("/save", authenticate, saveQuizResult); // Users must be authenticated to save results
router.get("/", authenticate, authorize(["Admin"]), getAllResults); // Only admins can fetch all results
router.get("/user", authenticate, getUserResults); // Users can fetch their own results
router.delete("/:id", authenticate, deleteQuizResult);

module.exports = router;