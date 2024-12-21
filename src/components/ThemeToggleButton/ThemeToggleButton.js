import React, { useState } from "react";
import "./ThemeToggleButton.css"; // Import the CSS file for the component

const ThemeToggleButton = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  // Toggle theme based on the button clicked
  const toggleTheme = (theme) => {
    setIsDarkTheme(theme === "dark");
    // Optionally, you can also set a class on the body to apply global styles
    document.body.classList.toggle("dark-theme", theme === "dark");
  };

  return (
    <div className="theme-toggle-container">
      <div className="theme-toggle-item">
        <span className="theme-label">Light</span>
        <button
          className={`theme-toggle-btn ${isDarkTheme ? "" : "active"}`}
          onClick={() => toggleTheme("light")}
        >
          <i className="fas fa-sun"></i>
        </button>
      </div>

      <div className="theme-toggle-item">
        <span className="theme-label">Dark</span>
        <button
          className={`theme-toggle-btn ${isDarkTheme ? "active" : ""}`}
          onClick={() => toggleTheme("dark")}
        >
          <i className="fas fa-moon"></i>
        </button>
      </div>
    </div>
  );
};

export default ThemeToggleButton;
