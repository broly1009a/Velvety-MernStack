const QuizResult = require("../models/QuizResult");
const Question = require("../models/Question");

// Function to determine skin type based on answer weights
const determineSkinType = (answers) => {
    const totalWeight = answers.reduce((sum, answer) => sum + (answer.weight || 0), 0);
    const minWeight = answers.length * 1; // 17 (if all answers are the lowest weight)
    const maxWeight = answers.length * 4; // 68 (if all answers are the highest weight)

    const range = maxWeight - minWeight;
    const normalizedScore = ((totalWeight - minWeight) / range) * 100;

    if (normalizedScore <= 25) return "Dry";
    if (normalizedScore <= 50) return "Combination";
    if (normalizedScore <= 75) return "Normal";
    return "Oily";
};

// Save quiz result
const saveQuizResult = async (req, res) => {
    try {
        const { answers } = req.body;
        console.log("🔹 Received Quiz Data:", answers);
        console.log("🔹 User in Request:", req.user); // Kiểm tra req.user

        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized - User not found" });
        }

        const userID = req.user.id; // Lấy userID từ token
        console.log("🔹 User ID:", userID);

        if (!answers || answers.length === 0) {
            return res.status(400).json({ message: "Answers are required." });
        }

        const skinType = determineSkinType(answers); // Tính loại da

        // Lưu kết quả quiz
        const newQuizResult = new QuizResult({
            userID,
            answers,
            skinType,
        });

        await newQuizResult.save();
        res.status(201).json({ message: "Quiz result saved successfully!", quizResult: newQuizResult });
    } catch (error) {
        console.error("Error saving quiz result:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


// Get all results (for admin)
const getAllResults = async (req, res) => {
    try {
        let { page = 1, limit = 10, sortBy = "createdDate", order = "desc", skinType } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);
        order = order === "asc" ? 1 : -1; // Convert order to MongoDB format

        if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
            return res.status(400).json({ message: "Invalid pagination parameters." });
        }

        // Build query
        const query = {};
        if (skinType) query.skinType = skinType; // Filter by skin type if provided

        // Count total results matching the query
        const totalResults = await QuizResult.countDocuments(query);
        const totalPages = Math.ceil(totalResults / limit);

        // Fetch results with filtering, sorting, and pagination
        const results = await QuizResult.find(query)
            .populate("userID", "name email")
            .sort({ [sortBy]: order }) // Dynamic sorting
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({
            totalResults,
            totalPages,
            currentPage: page,
            results,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get quiz results for a specific user
const getUserResults = async (req, res) => {
    try {
        const userId = req.user.id; // Lấy userId từ token

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Chỉ lấy field `skinType`, sắp xếp theo `createdDate` giảm dần (lấy kết quả mới nhất)
        const results = await QuizResult.find({ userID: userId })
            .sort({ createdDate: -1 })
            .select("skinType createdDate");

        res.json(results);
    } catch (error) {
        console.error("Error fetching user quiz results:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const deleteQuizResult = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the quiz result exists
        const quizResult = await QuizResult.findById(id);
        if (!quizResult) {
            return res.status(404).json({ message: "Quiz result not found." });
        }

        // Ensure the user owns the quiz result or is an admin
        if (quizResult.userID.toString() !== req.user.id && !req.user.roles.includes("Admin")) {
            return res.status(403).json({ message: "You are not authorized to delete this quiz result." });
        }

        // Delete the quiz result
        await QuizResult.findByIdAndDelete(id);
        res.status(200).json({ message: "Quiz result deleted successfully." });
    } catch (error) {
        console.error("Error deleting quiz result:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = {
    saveQuizResult,
    getAllResults,
    getUserResults,
    deleteQuizResult,
    determineSkinType,
};