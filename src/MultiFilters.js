import React, { useEffect, useState } from "react";
import { items as initialItems } from "./Items"; // Hardcoded list of items
import ThemeToggleButton from "./components/ThemeToggleButton/ThemeToggleButton.js";
import "./components/ThemeToggleButton/ThemeToggleButton.css";
import "./style.css";
import axios from "axios";
import { mapCategory } from "./components/CategoryMapping.js";
import { parseDuration, filterItems } from "./utils/Utils";
import {
  fetchVideoDetails,
  extractVideoId,
  videoCache,
} from "./components/services/YoutubeService.js";

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
  const [addedProject, setAddedProject] = useState(null);

  useEffect(() => {
    console.log("Filters updated:", filters);
  }, [filters]);

  useEffect(() => {
    console.log("Theme updated:", isDarkTheme ? "Dark" : "Light");
  }, [isDarkTheme]);

  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  const clearTechStackFilter = () => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      techStack: "",
    }));
  };

  const handleAddProject = async () => {
    console.log("handleAddProject called");
    try {
      if (!youtubeUrl) {
        alert("YouTube URL must not be empty");
        return;
      }

      // Fetch video details
      const videoDetails = await fetchVideoDetails(youtubeUrl);

      // Extract the necessary fields
      const {
        title: videoName,
        description: category,
        channelTitle: youtubeChannel,
        videoDurationInHours,
        techStack = [],
        difficulty = "Beginner",
        link = youtubeUrl,
      } = videoDetails;

      // Log the video duration
      console.log("Video duration in hours:", videoDurationInHours);

      // Prepare the data for the backend
      const newItem = {
        videoName,
        category,
        youtubeChannel,
        lengthInHours: videoDurationInHours, // Use the videoDurationInHours directly
        techStack,
        difficulty,
        link,
      };

      console.log("Prepared New Item:", newItem);

      // Test simple payload first
      const testData = newItem;
      const response = await axios.post("http://localhost:5000/api/test", {
        data: testData,
      });

      console.log("Backend Response:", response);

      if (response.status === 201) {
        alert("Project added successfully!");
        setAddedProject(response.data); // Update state with the added project
      } else {
        alert("Failed to add project. Please try again.");
      }
    } catch (error) {
      console.error(
        "Error adding project:",
        error.response || error.message || error
      );
      alert("An error occurred. Please check the console for details.");
    }
  };

  return (
    <div className="container">
      <div className="asd">
        <div className="header-container">
          {/* <h1 className="header-title">Projects Filter</h1> */}
          <div>
            <ThemeToggleButton />
          </div>
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
            <button onClick={handleAddProject}>Add Project</button>
          </div>

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
                placeholder="Enter keywords"
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
                <strong>Length:</strong> {item.lengthInHours > 0 ? `${Math.floor(item.lengthInHours)} hours ${Math.round((item.lengthInHours % 1) * 60)} minutes` : "< 1 hour"}
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
