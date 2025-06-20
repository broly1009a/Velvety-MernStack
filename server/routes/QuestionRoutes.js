const express = require("express");
const {
  getAllQuestions,
  addQuestion,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/QuestionController");
const { authenticate, authorize } = require("../middlewares/AuthMiddleware");

const router = express.Router();

// Public route: Get all questions
router.get("/", getAllQuestions);

// Protected routes: Only Managers can add, update, or delete questions
router.post("/", authenticate, authorize(["Manager"]), addQuestion);
router.put("/:id", authenticate, authorize(["Manager"]), updateQuestion);
router.delete("/:id", authenticate, authorize(["Manager"]), deleteQuestion);

module.exports = router;
