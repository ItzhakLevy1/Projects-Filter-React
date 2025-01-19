const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  videoName: { type: String, required: true },
  category: { type: String, required: true },
  youtubeChannel: { type: String, required: true },
  lengthInHours: { type: Number, required: true },
  techStack: { type: [String], required: false }, // Array of strings
  difficulty: { type: String, required: true },
  link: { type: String, required: true },
});

const Item = mongoose.model("Item", itemSchema);

module.exports = Item;
