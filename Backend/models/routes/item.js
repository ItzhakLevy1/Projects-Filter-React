// Define a POST route to add a new item
router.post("/", async (req, res) => {
  try {
    // Destructure the request body to get item details
    const {
      videoName,
      category,
      youtubeChannel,
      lengthInHours,
      techStack,
      difficulty,
      link,
    } = req.body;

    // Create and save the new item
    const newItem = new Item({
      videoName,
      category,
      youtubeChannel,
      lengthInHours,
      techStack,
      difficulty,
      link,
    });

    // Save the item to the database
    await newItem.save();
    // Respond with the created item
    res.status(201).json(newItem);
  } catch (err) {
    // Log and respond with an error message
    console.error("Error adding item:", err);
    res.status(400).json({ error: "Error adding item" });
  }
});
