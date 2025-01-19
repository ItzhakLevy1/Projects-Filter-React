router.post("/", async (req, res) => {
  try {
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

    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    console.error("Error adding item:", err);
    res.status(400).json({ error: "Error adding item" });
  }
});
