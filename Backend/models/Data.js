const mongoose = require("mongoose"); // Import mongoose to define the schema

/* Define the data schema with required fields */
const dataSchema = new mongoose.Schema({
  videoName: { type: String, required: true },
  youtubeChannel: { type: String, required: true },
  lengthInHours: { type: Number, required: true },
  techStack: { type: [String], required: false }, // Array of strings
  difficulty: { type: String, required: true },
  link: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Create the DataModel from the schema
const DataModel = mongoose.model("Data", dataSchema);

// Export the DataModel
module.exports = DataModel;
