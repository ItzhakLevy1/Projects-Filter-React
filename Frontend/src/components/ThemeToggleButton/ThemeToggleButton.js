import React, { useState, useEffect } from "react";
import "./ThemeToggleButton.css"; // Import the CSS file for the component

const ThemeToggleButton = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(true); // Set default to true

  useEffect(() => {
    // Add or remove the dark-theme class to the body when the component mounts or isDarkTheme changes
    document.body.classList.toggle("dark-theme", isDarkTheme);
  }, [isDarkTheme]);

  // Toggle theme based on the button clicked
  const toggleTheme = (theme, event) => {
    // Remove the clicked class from all buttons
    document.querySelectorAll(".theme-toggle-btn").forEach((button) => {
      button.classList.remove("clicked");
    });

    // Add the clicked class to the button
    event.currentTarget.classList.add("clicked");

    // Update the theme state
    setIsDarkTheme(theme === "dark");

    // Log the button clicked and its class change
    console.log(`Button clicked: ${theme}`);
    console.log(`Button classes: ${event.currentTarget.className}`);
  };

  return (
    <div className="theme-toggle-container">
      <div className="theme-toggle-item">
        <span className="theme-label">Light</span>
        <button
          className={`theme-toggle-btn ${isDarkTheme ? "" : "active"}`}
          onClick={(event) => toggleTheme("light", event)}
        >
          <i className="fas fa-sun"></i>
        </button>
      </div>

      <div className="theme-toggle-item">
        <span className="theme-label">Dark</span>
        <button
          className={`theme-toggle-btn ${isDarkTheme ? "active" : ""}`}
          onClick={(event) => toggleTheme("dark", event)}
        >
          <i className="fas fa-moon"></i>
        </button>
      </div>
    </div>
  );
};

export default ThemeToggleButton;