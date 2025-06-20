const mongoose = require('mongoose');
const { Schema } = mongoose;

const questionSchema = new Schema({
    questionText: { type: String, required: true },
    answerOptions: [
        {
            answerText: { type: String, required: true },
            weight: { type: Number, required: true } // Used to calculate skin type
        }
    ]
});

module.exports = mongoose.model("Question", questionSchema);
