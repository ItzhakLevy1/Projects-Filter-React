// Import mongoose to define the schema
const mongoose = require("mongoose");

// Define the item schema with required fields
const itemSchema = new mongoose.Schema({
  videoName: { type: String, required: true },
  youtubeChannel: { type: String, required: true },
  lengthInHours: { type: Number, required: true },
  techStack: { type: [String], required: false }, // Array of strings
  difficulty: { type: String, required: true },
  link: { type: String, required: true },
});

// Create the Item model from the schema
const Item = mongoose.model("Item", itemSchema);

// Export the Item model
module.exports = Item;
