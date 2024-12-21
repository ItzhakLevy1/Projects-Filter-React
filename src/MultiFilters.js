// Import necessary libraries and components
import React, { useEffect, useState } from "react";
import { items } from "./Items"; // Import a list of items to be filtered
import "./style.css"; // Import custom styles

// Main functional component for filtering projects
export default function MultiFilters() {
  // State for managing filter values
  const [filters, setFilters] = useState({
    videoName: "", // Selected project videoName
    youtubeChannel: "", // Selected YouTube channel
    minHours: 0, // Minimum hours for project duration
    maxHours: "", // Maximum hours for project duration
    techStack: "", // Keywords for filtering by tech stack
    difficulty: "", // Selected difficulty level
  });

  const [youtubeUrl, setYoutubeUrl] = useState(""); // State for YouTube URL input
  const [filteredItems, setFilteredItems] = useState(items); // State for storing the filtered items to display
  const [isDarkTheme, setIsDarkTheme] = useState(false); // State for theme

  // Log initial state
  console.log("Initial filters state:", filters);
  console.log("Initial filteredItems state:", filteredItems);

  // Call filterItems immediately after setting the initial state of filters
  useEffect(() => {
    console.log("Calling filterItems on initial render");
    filterItems();
  }, []);

  // Function to fetch video details from the YouTube Data API
  const fetchVideoDetails = async (url) => {
    const videoId = new URL(url).searchParams.get("v"); // Extract the video ID from the YouTube URL using the "v" query parameter

    const apiKey = process.env.REACT_APP_YOUTUBE_API_KEY; // Load the API key from the environment variables

    // Build the API request URL to fetch video details and content details
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${apiKey}`;

    // Make the API request to fetch video details
    const response = await fetch(apiUrl);

    // Parse the JSON response
    const data = await response.json();

    // Debugging: Log the fetched video details and the video title
    console.log("Fetched video details:", data);
    console.log("Fetched video details:", data.items[0].snippet.title);

    // Extract the video object from the response data
    const video = data.items[0];

    // Return an object containing the extracted video details
    return {
      videoName: video.snippet.title,
      youtubeChannel: video.snippet.channelTitle,
      videoDurationInHours: parseISO8601Duration(video.contentDetails.duration),
      techStack: [], // Placeholder for tech stack (can be extracted if available)
      difficulty: "Intermediate", // Default difficulty (adjust as needed)
      link: url, // Original YouTube URL
    };
  };

  // Helper function to convert ISO 8601 duration to hours
  const parseISO8601Duration = (duration) => {
    // Match the ISO 8601 duration format (e.g., "PT1H30M45S")
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

    // Extract hours, minutes, and seconds, defaulting to 0 if not present
    const hours = match[1] ? parseInt(match[1].replace("H", "")) : 0;
    const minutes = match[2] ? parseInt(match[2].replace("M", "")) : 0;
    const seconds = match[3] ? parseInt(match[3].replace("S", "")) : 0;

    // Convert total time to hours (fractional hours for minutes and seconds)
    return hours + minutes / 60 + seconds / 3600;
  };

  // Predefined arrays for difficulty levels and hour range options
  const difficulties = ["Beginner", "Intermediate", "Advanced"];
  const maxHourOptions = ["0-5 hours", "5-10 hours", "Above 10 hours"];

  // Extract unique project videoNames and YouTube channels from the items list
  const uniqueProjectvideoNames = [
    ...new Set(items.map((item) => item.videoName)),
  ];
  const uniqueYouTubeChannels = [
    ...new Set(items.map((item) => item.youtubeChannel)),
  ];

  // Extract unique tech stack keywords from the items list
  const uniqueTechStack = [
    ...new Set(
      items.flatMap((item) => item.techStack.map((tech) => tech.toLowerCase()))
    ),
  ].sort();

  // Automatically filter items whenever the filters state changes
  useEffect(() => {
    filterItems();
  }, [filters]);

  // Function to filter items based on selected filters
  const filterItems = () => {
    console.log("Filtering items with filters:", filters);
    let filtered = items.filter((item) => {
      // Split the tech stack input into keywords for filtering
      const techKeywords = filters.techStack
        .toLowerCase()
        .split(" ")
        .filter((word) => word.trim() !== "");

      // Determine if the project falls within the selected hour range
      const isWithinMaxHours =
        filters.maxHours === "" ||
        (filters.maxHours === "0-5 hours" && item.lengthInHours <= 5) ||
        (filters.maxHours === "5-10 hours" &&
          item.lengthInHours > 5 &&
          item.lengthInHours <= 10) ||
        (filters.maxHours === "Above 10 hours" && item.lengthInHours > 10);

      // Log each condition
      console.log("Checking item:", item);
      console.log(
        "Condition videoName:",
        filters.videoName === "" || item.videoName === filters.videoName
      );
      console.log(
        "Condition youtubeChannel:",
        filters.youtubeChannel === "" ||
          item.youtubeChannel === filters.youtubeChannel
      );
      console.log(
        "Condition minHours:",
        item.lengthInHours >= filters.minHours
      );
      console.log("Condition isWithinMaxHours:", isWithinMaxHours);
      console.log(
        "Condition techStack:",
        techKeywords.length === 0 ||
          techKeywords.some((keyword) =>
            item.techStack.some((tech) => tech.toLowerCase().includes(keyword))
          )
      );
      console.log(
        "Condition difficulty:",
        filters.difficulty === "" || item.difficulty === filters.difficulty
      );

      // Apply all filter conditions
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

    // Update the filtered items state
    console.log("Filtered items:", filtered);
    setFilteredItems(filtered);
  };

  // Function to update a specific filter value
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Function to clear the tech stack filter
  const clearTechStackFilter = () => {
    handleFilterChange("techStack", "");
  };

  // Function to handle adding a new project based on YouTube URL
  const handleAddProject = async () => {
    // If the input URL is empty, do nothing
    if (!youtubeUrl) return;

    // Fetch the video details using the URL
    const newItem = await fetchVideoDetails(youtubeUrl);

    // Add the fetched video details as a new item to the items array
    items.push(newItem);

    // Clear the YouTube URL input field
    setYoutubeUrl("");
  };

  // Function to toggle the theme
const toggleTheme = () => {
  // Update the `isDarkTheme` state by toggling its current value
  setIsDarkTheme((prevTheme) => !prevTheme); 
  // If `isDarkTheme` is true, set it to false (light theme)
  // If `isDarkTheme` is false, set it to true (dark theme)

  // Add or remove the "dark-theme" class on the <body> element
  document.body.classList.toggle("dark-theme");
  // If the "dark-theme" class is not present, this will add it (activating dark theme)
  // If the "dark-theme" class is already present, this will remove it (activating light theme)
};


  return (
    <div className="container">
      <div className="header-container">
        <h1>Projects Filter</h1>
        <label className="toggle-switch">
          <input type="checkbox" checked={isDarkTheme} onChange={toggleTheme} />
          <span className="slider"></span>
        </label>
        <div className="filters-container">
          {/* New input field for YouTube URL */}
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

          {/* Filter by Project Name */}
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

          {/* Filter by YouTube Channel */}
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

          {/* Filter by Max Hours */}
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

          {/* Filter by Tech Stack */}
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

          {/* Filter by Difficulty */}
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

      {/* Section to display filtered items */}
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
