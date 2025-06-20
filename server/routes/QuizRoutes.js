const express = require('express');
const { createQuiz, getQuizWithQuestions } = require('../controllers/QuizController');
const router = express.Router();

router.post('/', createQuiz); // Create a new quiz
router.get('/:id', getQuizWithQuestions); // Get quiz with questions by quiz ID

module.exports = router;

