import React, { useState, useEffect } from "react";
import "./ThemeToggleButton.css"; 

const ThemeToggleButton = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(true); // Set default to true

  useEffect(() => {
    // Add the dark-theme class to the body when the component mounts to apply dark theme by default
    if (isDarkTheme) {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
  }, [isDarkTheme]);

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