// RoutePage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "./ThemeContext.jsx";
import "./App.css";

export default function RoutePage() {
  const { routeNumber } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [queryInput, setQueryInput] = useState("");
  const [vehicles, setVehicles] = useState(null);const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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

  useEffect(() => {
    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const response = await fetch("https://42cummer-transseeapi.hf.space/listvehiclesbyroute", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  route: routeNumber  // pass your variable here
                })
              });
            if (!response.ok){
                throw new Error(`HTTP ${response.status}`);
            }
            const data = await response.json()
            setVehicles(data);
        } catch (err) {
            console.error('Failed to fetch routes:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    fetchVehicles();
  }, []);

  if (loading) {
    return (
      <div className="app-container">
        <div className="menu-bar">
          <span className="status-text">Loading Routes...</span>
          <button className="menu-button" onClick={handleBackToMap}>
            Back to Map
          </button>
          <button className="menu-button" onClick={handleBackToRoutes}>
            Back to All Routes
          </button>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h1>Loading Vehicles...</h1>
          <p>Please wait while we locate vehicles on route {routeName}.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <div className="menu-bar">
          <span className="status-text">Error Locating Vehicles</span>
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
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h1>Error locating Vehicles</h1>
          <p>Failed to locate vehicles: {error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Menu bar */}
      <div className="menu-bar">
        <span className="status-text">Viewing Vehicles for {routeName}</span>
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
