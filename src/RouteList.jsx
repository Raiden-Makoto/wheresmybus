// RouteList.jsx
import { useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeContext.jsx";
import "./App.css";

export default function RouteList() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleBackToMap = () => {
    navigate("/");
  };

  return (
    <div className="app-container">
      {/* Menu bar */}
      <div className="menu-bar">
        <span className="status-text">Viewing Routes</span>
        <input
          type="text"
          placeholder="Search routes..."
          className="search-input"
        />
        <button className="menu-button">
          Search for a Stop
        </button>
        <button className="menu-button">
          Search by Route
        </button>
        <button className="menu-button" onClick={handleBackToMap}>
          Back to Map
        </button>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "light" ? "🌙" : "☀️"}
        </button>
      </div>

      {/* Content area */}
      <div style={{ padding: "20px" }}>
        <h1>Bus Routes</h1>
        <p>List of all available bus routes will go here.</p>
      </div>
    </div>
  );
}
