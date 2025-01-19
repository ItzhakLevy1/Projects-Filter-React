const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const DataModel = require("./models/Data"); // Import your model

// Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/ProjectFilterReact", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(cors()); // Enable CORS for development
app.use(express.json()); // Parse JSON bodies

app.post("/api/test", async (req, res) => {
  try {
    console.log("Received data:", req.body); // Log the entire request body
    const { data } = req.body;

    // Save the received data in MongoDB
    const newData = new DataModel({ data });
    const savedData = await newData.save();

    res.status(201).json({ message: "Data saved successfully", savedData });
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).json({ error: "Failed to save data" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
