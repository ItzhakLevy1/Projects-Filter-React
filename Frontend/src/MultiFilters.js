import React, { useEffect, useState } from "react";
import ThemeToggleButton from "./components/ThemeToggleButton/ThemeToggleButton.js";
import CustomAlert from "./components/CustomAlert.js";
import "./components/ThemeToggleButton/ThemeToggleButton.css";
import "./components/CustomAlert.css";
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
  const [filteredItems, setFilteredItems] = useState([]);
  const [allItems, setAllItems] = useState([]); // Store all items
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [addedProject, setAddedProject] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [doneProjects, setDoneProjects] = useState(new Set()); // Track done projects
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    console.log("Filters updated:", filters);
    applyFilters(); // Apply filters whenever filters state changes
  }, [filters]);

  useEffect(() => {
    console.log("Theme updated:", isDarkTheme ? "Dark" : "Light");
  }, [isDarkTheme]);

  useEffect(() => {
    // Fetch items from the backend
    const fetchItems = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/items");
        setAllItems(response.data); // Store all items
        setFilteredItems(response.data); // Initially display all items
        console.log("Fetched projects from backend:", response.data); // Log fetched projects
      } catch (error) {
        console.error("Error fetching items from backend:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    };

    fetchItems();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  const clearFilter = (key) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: "",
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
        setAlertMessage("YouTube URL must not be empty");
        return;
      }

      // Fetch video details
      const videoDetails = await fetchVideoDetails(youtubeUrl);

      // Extract the necessary fields
      const {
        title: videoName,
        youtubeChannel,
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
        youtubeChannel,
        lengthInHours: videoDurationInHours, // Use the videoDurationInHours directly
        techStack,
        difficulty,
        link,
      };

      console.log("Prepared New Item:", newItem);

      // Ensure the request body matches the expected structure
      const requestBody = { data: newItem };

      // Test simple payload first
      const response = await axios.post(
        "http://localhost:5000/api/save-data",
        requestBody
      );

      console.log("Backend Response:", response);

      if (response.status === 201) {
        setAlertMessage("Project added successfully!");
        setAddedProject(response.data); // Update state with the added project
        setAllItems((prevItems) => [...prevItems, newItem]); // Add the new project to the list
        applyFilters(); // Apply filters to include the new project
        setYoutubeUrl(""); // Clear the YouTube URL field
      } else if (response.status === 409) {
        setAlertMessage("Data already exists");
      } else {
        setAlertMessage("Failed to add project. Please try again.");
      }
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setAlertMessage("Project already exists");
      } else {
        console.error(
          "Error adding project:",
          error.response || error.message || error
        );
        setAlertMessage(
          "An error occurred. Please check the console for details."
        );
      }
    }
  };

  /* Handle the change event for the "Done" checkbox */
  const handleDoneChange = (videoName) => {
    setDoneProjects((prevDoneProjects) => {
      const newDoneProjects = new Set(prevDoneProjects);
      if (newDoneProjects.has(videoName)) {
        newDoneProjects.delete(videoName);
      } else {
        newDoneProjects.add(videoName);
      }
      return newDoneProjects;
    });
  };

  const applyFilters = () => {
    const filtered = filterItems(allItems, filters);
    setFilteredItems(filtered);
  };

  // Get unique YouTube channels
  const uniqueChannels = [
    ...new Set(allItems.map((item) => item.youtubeChannel)),
  ];

  return (
    <div className="container">
      {alertMessage && (
        <CustomAlert
          message={alertMessage}
          onClose={() => setAlertMessage("")}
        />
      )}
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
            <button className="add-project-button" onClick={handleAddProject}>
              Add Project
            </button>
          </div>

          <div className="filter">
            <label>Filter by Project videoName</label>
            <div style={{ position: "relative" }}>
              <select
                value={filters.videoName}
                onChange={(e) =>
                  handleFilterChange("videoName", e.target.value)
                }
              >
                <option value="">Select Project</option>
                {allItems.map((item, index) => (
                  <option key={index} value={item.videoName}>
                    {item.videoName}
                  </option>
                ))}
              </select>
              {filters.videoName && (
                <button
                  className="clear-button"
                  onClick={() => clearFilter("videoName")}
                >
                  &times;
                </button>
              )}
            </div>
          </div>

          <div className="filter">
            <label>Filter by YouTube Channel</label>
            <div style={{ position: "relative" }}>
              <select
                value={filters.youtubeChannel}
                onChange={(e) =>
                  handleFilterChange("youtubeChannel", e.target.value)
                }
              >
                <option value="">Select Channel</option>
                {uniqueChannels.map((channel, index) => (
                  <option key={index} value={channel}>
                    {channel}
                  </option>
                ))}
              </select>
              {filters.youtubeChannel && (
                <button
                  className="clear-button"
                  onClick={() => clearFilter("youtubeChannel")}
                >
                  &times;
                </button>
              )}
            </div>
          </div>

          <div className="filter">
            <label>Filter by Max Hours</label>
            <div style={{ position: "relative" }}>
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
              {filters.maxHours && (
                <button
                  className="clear-button"
                  onClick={() => clearFilter("maxHours")}
                >
                  &times;
                </button>
              )}
            </div>
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
                {allItems
                  .flatMap((item) => item.techStack)
                  .map((tech, index) => (
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
            <div style={{ position: "relative" }}>
              <select
                value={filters.difficulty}
                onChange={(e) =>
                  handleFilterChange("difficulty", e.target.value)
                }
              >
                <option value="">Select Difficulty</option>
                {difficulties.map((level, index) => (
                  <option key={index} value={level}>
                    {level}
                  </option>
                ))}
              </select>
              {filters.difficulty && (
                <button
                  className="clear-button"
                  onClick={() => clearFilter("difficulty")}
                >
                  &times;
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="items-container">
        {loading ? (
          <p>Loading projects...</p>
        ) : filteredItems.length > 0 ? (
          filteredItems.map((item, index) => (
            <div
              key={`items-${index}`}
              className={`item ${
                doneProjects.has(item.videoName) ? "done" : ""
              }`}
            >
              <p>
                <strong>Project:</strong> {item.videoName}
              </p>
              <p>
                <strong>YouTube Channel:</strong> {item.youtubeChannel}
              </p>
              <p>
                <strong>Length:</strong>{" "}
                {item.lengthInHours > 0
                  ? `${Math.floor(item.lengthInHours)} hours ${Math.round(
                      (item.lengthInHours % 1) * 60
                    )} minutes`
                  : "< 1 hour"}
              </p>
              <p>
                <strong>Tech Stack:</strong>{" "}
                {item.techStack?.join(", ") || "N/A"}
              </p>
              <p>
                <strong>Difficulty:</strong> {item.difficulty || "N/A"}
              </p>
              {item.link && (
                <p>
                  <strong>Link:</strong>{" "}
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    Watch Now
                  </a>
                </p>
              )}
              <div>
                <label>
                  <input
                    type="checkbox"
                    checked={doneProjects.has(item.videoName)}
                    onChange={() => handleDoneChange(item.videoName)}
                  />
                  Done
                </label>
              </div>
            </div>
          ))
        ) : (
          <p>No projects found.</p>
        )}
      </div>
    </div>
  );
}
