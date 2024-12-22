import React, { useEffect, useState } from "react";
import { items as initialItems } from "./Items"; // Import a hard coded list of items to be filtered
import ThemeToggleButton from "./components/ThemeToggleButton/ThemeToggleButton.js";
import "./components/ThemeToggleButton/ThemeToggleButton.css";
import "./style.css";
import axios from "axios"; // Import axios for API calls
import { mapCategory } from "./components/CategoryMapping"; // Import mapCategory function

export default function MultiFilters() {
  const [filters, setFilters] = useState({
    videoName: "",
    youtubeChannel: "",
    minHours: 0,
    maxHours: "",
    techStack: "",
    difficulty: "",
  });

  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [filteredItems, setFilteredItems] = useState(initialItems);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [url, setUrl] = useState("");

  useEffect(() => {
    filterItems();
  }, [filters]);

  useEffect(() => {
    if (isDarkTheme) {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
  }, [isDarkTheme]); // Run this effect whenever `isDarkTheme` changes

  // Helper function to parse ISO 8601 duration to hours
  const parseDuration = (isoDuration) => {
    const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = parseInt(match[1]?.replace("H", "") || "0", 10);
    const minutes = parseInt(match[2]?.replace("M", "") || "0", 10);
    const seconds = parseInt(match[3]?.replace("S", "") || "0", 10);

    const totalHours = hours + minutes / 60 + seconds / 3600;
    console.log(
      `Duration parsed: ${hours} hours, ${minutes} minutes, ${seconds} seconds (${totalHours.toFixed(
        2
      )} hours)`
    );
    // console.log("totalHours", totalHours);
    return totalHours;
  };

  // Fetch video details using the YouTube Data API
  const fetchVideoDetails = async (url) => {
    try {
      const videoId = new URL(url).searchParams.get("v");
      if (!videoId) {
        console.error("Invalid YouTube URL. Could not extract video ID.");
        return;
      }

      const apiKey = process.env.REACT_APP_YOUTUBE_API_KEY;
      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${apiKey}`;

      console.log("Fetching video details from API...");
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error(`Error fetching video details: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("API response - data:", data);
      console.log(
        "API response - channelTitle / Name :",
        data.items[0].snippet.channelTitle
      );
      const totalHours = parseDuration(data.items[0].contentDetails.duration);
      console.log("API response - Duration / Length :", totalHours);
      console.log(
        "API response - Video's Name :",
        data.items[0].snippet.localized.title
      );

      const categoryId = data.items[0].snippet.categoryId;
      const categoryName = mapCategory(categoryId);

      console.log(
        "Category Name :",
        mapCategory(data.items[0].snippet.categoryId)
      );

      if (data.items.length === 0) {
        console.log("No video found with the provided video ID.");
        return;
      }

      const video = data.items[0];
      const videoDurationInHours = parseDuration(
        data.items[0].contentDetails.duration
      );

      // Determine difficulty based on totalHours
      let difficulty = "Intermediate";
      if (totalHours <= 5) {
        difficulty = "Beginner";
      } else if (totalHours > 10) {
        difficulty = "Advanced";
      }
      console.log("Difficulty level :", difficulty);

      return {
        videoName: video.snippet.title,
        youtubeChannel: video.snippet.channelTitle,
        videoDurationInHours: parseISO8601Duration(
          data.items[0].contentDetails.duration
        ),
        techStack: [], // You can populate this if needed
        difficulty: difficulty, // Set difficulty based on totalHours
        link: url,
      };
    } catch (error) {
      console.error("Error in fetchVideoDetails:", error);
    }
  };

  const parseISO8601Duration = (duration) => {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = match[1] ? parseInt(match[1].replace("H", "")) : 0;
    const minutes = match[2] ? parseInt(match[2].replace("M", "")) : 0;
    const seconds = match[3] ? parseInt(match[3].replace("S", "")) : 0;
    return hours + minutes / 60 + seconds / 3600;
  };

  const difficulties = ["Beginner", "Intermediate", "Advanced"];
  const maxHourOptions = ["0-5 hours", "5-10 hours", "Above 10 hours"];
  const uniqueProjectvideoNames = [
    ...new Set(initialItems.map((item) => item.videoName)),
  ];
  const uniqueYouTubeChannels = [
    ...new Set(initialItems.map((item) => item.youtubeChannel)),
  ];
  const uniqueTechStack = [
    ...new Set(
      initialItems.flatMap((item) =>
        item.techStack.map((tech) => tech.toLowerCase())
      )
    ),
  ].sort();

  // Filtering function based on the filters state
  const filterItems = () => {
    let filtered = initialItems.filter((item) => {
      const techKeywords = filters.techStack
        .toLowerCase()
        .split(" ")
        .filter((word) => word.trim() !== "");
      const isWithinMaxHours =
        filters.maxHours === "" ||
        (filters.maxHours === "0-5 hours" && item.lengthInHours <= 5) ||
        (filters.maxHours === "5-10 hours" &&
          item.lengthInHours > 5 &&
          item.lengthInHours <= 10) ||
        (filters.maxHours === "Above 10 hours" && item.lengthInHours > 10);

      return (
        (filters.videoName === "" || item.videoName === filters.videoName) &&
        (filters.youtubeChannel === "" ||
          item.youtubeChannel === filters.youtubeChannel) &&
        item.lengthInHours >= filters.minHours &&
        isWithinMaxHours &&
        (techKeywords.length === 0 ||
          techKeywords.some((keyword) =>
            item.techStack.some((tech) => tech.toLowerCase().includes(keyword))
          )) &&
        (filters.difficulty === "" || item.difficulty === filters.difficulty)
      );
    });

    setFilteredItems(filtered);
  };

  // Update filter values dynamically
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Clear tech stack filter
  const clearTechStackFilter = () => {
    handleFilterChange("techStack", "");
  };

  // Add a new project from YouTube URL
  const handleAddProject = async () => {
    if (!youtubeUrl) return;

    const newItem = await fetchVideoDetails(youtubeUrl);
    setFilteredItems((prevItems) => [...prevItems, newItem]);
    setYoutubeUrl(""); // Clear input
  };

  const handleInputChange = (e) => {
    setUrl(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // YouTube Data API call
    const videoId = url.split("v=")[1]; // Get video ID from URL
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${process.env.REACT_APP_YOUTUBE_API_KEY}`
    );
    const data = response.data.items[0];
    const itemData = {
      videoName: data.snippet.title,
      category: "Programming", // Example category, you can customize
      youtubeChannel: data.snippet.channelId,
      lengthInHours: parseInt(
        data.contentDetails.duration.match(/\d+/)[0] / 60
      ), // Extract video length in hours
      techStack: 5, // Example value
      difficulty: 3, // Example value
      link: `https://www.youtube.com/watch?v=${videoId}`,
    };

    // Send POST request to backend
    try {
      await axios.post("http://localhost:5000/api/items", itemData);
      console.log("Item added:", itemData);
    } catch (err) {
      console.error("Error adding item:", err);
    }
  };

  return (
    <div className="container">
      <div className="header-container">
        <h1>Projects Filter</h1>
        <div>
          <ThemeToggleButton />
        </div>
        <div className="filters-container">
          <div className="filter">
            <label>Add Project by YouTube URL</label>
            <input
              type="text"
              placeholder="Enter YouTube URL"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleAddProject();
              }}
            />
          </div>
          {/* <form onSubmit={handleSubmit}>
            <label>
              Add Project by YouTube URL:
              <input
                type="text"
                value={url}
                onChange={handleInputChange}
                placeholder="Enter YouTube URL"
              />
            </label>
            <button type="submit">Submit</button>
          </form> */}
          <div className="filter">
            <label>Filter by Project videoName</label>
            <select
              value={filters.videoName}
              onChange={(e) => handleFilterChange("videoName", e.target.value)}
            >
              <option value="">Select Project</option>
              {uniqueProjectvideoNames.map((videoName, index) => (
                <option key={index} value={videoName}>
                  {videoName}
                </option>
              ))}
            </select>
          </div>

          <div className="filter">
            <label>Filter by YouTube Channel</label>
            <select
              value={filters.youtubeChannel}
              onChange={(e) =>
                handleFilterChange("youtubeChannel", e.target.value)
              }
            >
              <option value="">Select Channel</option>
              {uniqueYouTubeChannels.map((channel, index) => (
                <option key={index} value={channel}>
                  {channel}
                </option>
              ))}
            </select>
          </div>

          <div className="filter">
            <label>Filter by Max Hours</label>
            <select
              value={filters.maxHours}
              onChange={(e) => handleFilterChange("maxHours", e.target.value)}
            >
              <option value="">Select Range</option>
              {maxHourOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="filter">
            <label>Filter by Tech Stack</label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                list="techStackSuggestions"
                placeholder="Enter keywords (e.g., React Node)"
                value={filters.techStack}
                onChange={(e) =>
                  handleFilterChange("techStack", e.target.value)
                }
              />
              <datalist id="techStackSuggestions">
                {uniqueTechStack.map((tech, index) => (
                  <option key={index} value={tech} />
                ))}
              </datalist>
              {filters.techStack && (
                <button className="clear-button" onClick={clearTechStackFilter}>
                  &times;
                </button>
              )}
            </div>
          </div>

          <div className="filter">
            <label>Filter by Difficulty</label>
            <select
              value={filters.difficulty}
              onChange={(e) => handleFilterChange("difficulty", e.target.value)}
            >
              <option value="">Select Difficulty</option>
              {difficulties.map((level, index) => (
                <option key={index} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="items-container">
        {filteredItems.length > 0 ? (
          filteredItems.map((item, index) => (
            <div key={`items-${index}`} className="item">
              <p>
                <strong>Project:</strong> {item.videoName}
              </p>
              <p>
                <strong>YouTube:</strong> {item.youtubeChannel}
              </p>
              <p>
                <strong>Length:</strong> {item.videoDurationInHours} hours
              </p>
              <p>
                <strong>Tech Stack:</strong> {item.techStack.join(", ")}
              </p>
              <p>
                <strong>Difficulty:</strong> {item.difficulty}
              </p>
              {item.link && (
                <p>
                  <strong>Link:</strong>{" "}
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    Watch Now
                  </a>
                </p>
              )}
            </div>
          ))
        ) : (
          <p>No projects found.</p>
        )}
      </div>
    </div>
  );
}
