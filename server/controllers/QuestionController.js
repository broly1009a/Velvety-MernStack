const Question = require("../models/Question");

// Get all questions (since there's only one quiz)
const getAllQuestions = async (req, res) => {
    try {
        const questions = await Question.find();
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add a new question
const addQuestion = async (req, res) => {
    try {
        const { questionText, answerOptions } = req.body;

        if (!questionText || !answerOptions || !Array.isArray(answerOptions) || answerOptions.length === 0) {
            return res.status(400).json({ message: "Invalid question data" });
        }

        const newQuestion = new Question({
            questionText,
            answerOptions
        });

        await newQuestion.save();
        res.status(201).json({ message: "Question added successfully!", question: newQuestion });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update an existing question
const updateQuestion = async (req, res) => {
    try {
        const { questionText, answerOptions } = req.body;
        const { id } = req.params;

        if (!questionText || !answerOptions || !Array.isArray(answerOptions)) {
            return res.status(400).json({ message: "Invalid question data" });
        }

        const updatedQuestion = await Question.findByIdAndUpdate(
            id,
            { questionText, answerOptions },
            { new: true }
        );

        if (!updatedQuestion) {
            return res.status(404).json({ message: "Question not found" });
        }

        res.json({ message: "Question updated successfully!", question: updatedQuestion });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a question
const deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedQuestion = await Question.findByIdAndDelete(id);

        if (!deletedQuestion) {
            return res.status(404).json({ message: "Question not found" });
        }

        res.json({ message: "Question deleted successfully!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion
};
