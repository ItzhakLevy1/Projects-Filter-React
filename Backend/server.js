const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const DataModel = require("./models/Data"); // Import the model from MongoDB
const Item = require("./models/Item"); // Import the Item model

// Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/ProjectFilterReact", {
    useNewUrlParser: true, // Use the new MongoDB connection string parser
    useUnifiedTopology: true, // Use the new unified topology engine for MongoDB driver
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(cors()); // Enable CORS for development
app.use(express.json()); // Parse JSON bodies

/* Define a POST route to save data (new projects) */
app.post("/api/save-data", async (req, res) => {
  try {
    /* Log the received data */
    console.log("Received data:", req.body);
    const {
      videoName,
      youtubeChannel,
      lengthInHours,
      techStack,
      difficulty,
      link,
    } = req.body.data; // Access the fields from the nested data object

    // Check if all required fields are present
    if (!videoName) console.log("Missing videoName");
    if (!youtubeChannel) console.log("Missing youtubeChannel");
    if (!lengthInHours) console.log("Missing lengthInHours");
    if (!difficulty) console.log("Missing difficulty");
    if (!link) console.log("Missing link");

    if (!videoName || !youtubeChannel || !lengthInHours || !difficulty || !link) {
      console.log("Missing required fields");
      return res.status(400).json({ error: "Missing required fields" });
    }

    /* Check if the data already exists in the database before saving it to prevent duplications */
    const existingData = await DataModel.findOne({ videoName, youtubeChannel });
    if (existingData) {
      console.log("Project already exists");
      return res.status(409).json({ message: "Project already exists" });
    }

    /* Save the received data in MongoDB */
    console.log("Saving new data to the database");
    const newData = new Item({
      videoName,
      youtubeChannel,
      lengthInHours,
      techStack,
      difficulty,
      link,
    });
    const savedData = await newData.save();
    console.log("Data saved successfully:", savedData);

    /* Respond with a success message and the saved data */
    res.status(201).json({ message: "Data saved successfully", savedData });
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).json({ error: "Failed to save data" });
  }
});

/* Define a GET route to fetch all items (projects) */
app.get("/api/items", async (req, res) => {
  try {
    /* Fetch all items from the database */
    const items = await DataModel.find();
    /* Log the fetched items */
    console.log("Fetched items:", items);
    /* Respond with the fetched items */
    res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

/* Start the server */
const PORT = 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
