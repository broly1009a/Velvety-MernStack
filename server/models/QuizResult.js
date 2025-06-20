const mongoose = require('mongoose');
const { Schema } = mongoose;

const quizResultSchema = new Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // Nullable for guests
    answers: [
        {
            questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
            answerText: { type: String, required: true },
            weight: { type: Number, required: true }
        }
    ],
    skinType: { type: String, enum: ["Oily", "Dry", "Combination", "Normal"], required: true },
    createdDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model("QuizResult", quizResultSchema);
