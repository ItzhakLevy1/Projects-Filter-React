import React, { useEffect, useState } from "react";
import { items } from "./Items";
import "./style.css";

export default function MultiFilters() {
  const [filters, setFilters] = useState({
    name: "",
    youtubeChannel: "",
    minHours: 0,
    maxHours: "",
    techStack: "",
    difficulty: "",
  });

  const [filteredItems, setFilteredItems] = useState(items);

  const difficulties = ["Beginner", "Intermediate", "Advanced"];
  const maxHourOptions = ["0-5 hours", "5-10 hours", "Above 10 hours"];

  const uniqueProjectNames = [...new Set(items.map((item) => item.name))];
  const uniqueYouTubeChannels = [
    ...new Set(items.map((item) => item.youtubeChannel)),
  ];

  useEffect(() => {
    filterItems();
  }, [filters]);

  const filterItems = () => {
    let filtered = items.filter((item) => {
      const techKeywords = filters.techStack
        .toLowerCase()
        .split(" ")
        .filter((word) => word.trim() !== ""); // Split keywords by spaces

      const isWithinMaxHours =
        filters.maxHours === "" ||
        (filters.maxHours === "0-5 hours" && item.lengthInHours <= 5) ||
        (filters.maxHours === "5-10 hours" &&
          item.lengthInHours > 5 &&
          item.lengthInHours <= 10) ||
        (filters.maxHours === "Above 10 hours" && item.lengthInHours > 10);

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

    setFilteredItems(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="container">
      <div className="header-container">
        <h1>Projects Filter</h1>

        <div className="filters-container">
          <div className="filter">
            <label>Filter by Project Name</label>
            <select
              value={filters.name}
              onChange={(e) => handleFilterChange("name", e.target.value)}
            >
              <option value="">Select Project</option>
              {uniqueProjectNames.map((name, idx) => (
                <option key={idx} value={name}>
                  {name}
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
              {uniqueYouTubeChannels.map((channel, idx) => (
                <option key={idx} value={channel}>
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
              {maxHourOptions.map((option, idx) => (
                <option key={idx} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="filter">
            <label>Filter by Tech Stack</label>
            <input
              type="text"
              placeholder="Enter keywords (e.g., React Node)"
              value={filters.techStack}
              onChange={(e) => handleFilterChange("techStack", e.target.value)}
            />
          </div>

          <div className="filter">
            <label>Filter by Difficulty</label>
            <select
              value={filters.difficulty}
              onChange={(e) => handleFilterChange("difficulty", e.target.value)}
            >
              <option value="">Select Difficulty</option>
              {difficulties.map((level, idx) => (
                <option key={idx} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="items-container">
        {filteredItems.length > 0 ? (
          filteredItems.map((item, idx) => (
            <div key={`items-${idx}`} className="item">
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
