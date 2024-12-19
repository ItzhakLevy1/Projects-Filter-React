// Import necessary libraries and components
import React, { useEffect, useState } from "react";
import { items } from "./Items"; // Import a list of items to be filtered
import "./style.css"; // Import custom styles

// Main functional component for filtering projects
export default function MultiFilters() {
  // State for managing filter values
  const [filters, setFilters] = useState({
    name: "", // Selected project name
    youtubeChannel: "", // Selected YouTube channel
    minHours: 0, // Minimum hours for project duration
    maxHours: "", // Maximum hours for project duration
    techStack: "", // Keywords for filtering by tech stack
    difficulty: "", // Selected difficulty level
  });

  // State for storing the filtered items to display
  const [filteredItems, setFilteredItems] = useState(items);

  // Predefined arrays for difficulty levels and hour range options
  const difficulties = ["Beginner", "Intermediate", "Advanced"];
  const maxHourOptions = ["0-5 hours", "5-10 hours", "Above 10 hours"];

  // Extract unique project names and YouTube channels from the items list
  const uniqueProjectNames = [...new Set(items.map((item) => item.name))];
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

      // Apply all filter conditions
      return (
        (filters.name === "" || item.name === filters.name) &&
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

  return (
    <div className="container">
      <div className="header-container">
        <h1>Projects Filter</h1>

        <div className="filters-container">
          {/* Filter by Project Name */}
          <div className="filter">
            <label>Filter by Project Name</label>
            <select
              value={filters.name}
              onChange={(e) => handleFilterChange("name", e.target.value)}
            >
              <option value="">Select Project</option>
              {uniqueProjectNames.map((name, index) => (
                <option key={index} value={name}>
                  {name}
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
                <strong>Project:</strong> {item.name}
              </p>
              <p>
                <strong>YouTube:</strong> {item.youtubeChannel}
              </p>
              <p>
                <strong>Length:</strong> {item.lengthInHours} hours
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
