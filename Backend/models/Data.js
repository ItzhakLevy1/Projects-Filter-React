const mongoose = require("mongoose");

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

const DataModel = mongoose.model("Data", dataSchema);

module.exports = DataModel;
