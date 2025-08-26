// RoutePage.jsx
import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "./ThemeContext.jsx";
import "./App.css";

export default function RoutePage() {
  const { routeNumber } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [queryInput, setQueryInput] = useState("");
  
  // Get route name from navigation state
  const routeName = location.state?.routeName || `Route ${routeNumber}`;

  const handleBackToMap = () => {
    navigate("/");
  };

  const handleBackToRoutes = () => {
    navigate("/routes");
  };

  const handleSearchStop = () => {
    if (queryInput.trim()) {
      navigate(`/stop/${queryInput.trim()}`);
    }
  };

  return (
    <div className="app-container">
      {/* Menu bar */}
      <div className="menu-bar">
        <span className="status-text">Viewing Route {routeNumber}</span>
        <input
            type="text"
            placeholder="Search..."
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            className="search-input"
        />
         <button className="menu-button" onClick={handleSearchStop}>
          Search for a Stop
        </button>
        <button className="menu-button" onClick={handleBackToRoutes}>
          Back to All Routes
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
        <h1 style={{ 
          color: routeNumber >= 200 && routeNumber <= 299 ? '#ec4899' : 
                 routeNumber >= 300 && routeNumber <= 399 ? '#3b82f6' : 
                 routeNumber >= 900 && routeNumber <= 999 ? '#10b981' : 'inherit' 
        }}>
          {routeName}
        </h1>
        <p>Route details and information will go here.</p>
      </div>
    </div>
  );
}
