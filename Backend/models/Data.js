const mongoose = require("mongoose"); // Import mongoose to define the schema

/* Define the data schema with required fields */
const dataSchema = new mongoose.Schema({
  data: {
    type: Object,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the DataModel from the schema
const DataModel = mongoose.model("Data", dataSchema);

// Export the DataModel
module.exports = DataModel;
