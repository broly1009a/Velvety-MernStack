const mongoose = require('mongoose');
const { Schema } = mongoose;
const blogSchema = new Schema({
    title: { type: String, required: true },
    image: { type: String },
    description: { type: String },
    content: { type: String, required: true },
    createdDate: { type: Date, default: Date.now },
    availability: { type: Boolean, default: true },
  });
  
  module.exports = mongoose.model("Blog", blogSchema);
  