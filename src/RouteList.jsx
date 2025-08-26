// RouteList.jsx
import { useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeContext.jsx";
import { useState, useEffect } from "react";
import "./App.css";

export default function RouteList() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [routes, setRoutes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleBackToMap = () => {
    navigate("/");
  };

  // Fetch routes from API
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://42cummer-transseeapi.hf.space/routelist');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        setRoutes(data);
      } catch (err) {
        console.error('Failed to fetch routes:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  if (loading) {
    return (
      <div className="app-container">
        <div className="menu-bar">
          <span className="status-text">Loading Routes...</span>
          <button className="menu-button" onClick={handleBackToMap}>
            Back to Map
          </button>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h1>Loading Routes...</h1>
          <p>Please wait while we fetch route information.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <div className="menu-bar">
          <span className="status-text">Error Loading Routes</span>
          <button className="menu-button" onClick={handleBackToMap}>
            Back to Map
          </button>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h1>Error Loading Routes</h1>
          <p>Failed to load routes: {error}</p>
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
        <span className="status-text">Viewing Routes</span>
        <input
          type="text"
          placeholder="Search routes..."
          className="search-input"
        />
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
        {/* Regular Routes (1-199) */}
        <div style={{ marginTop: "30px" }}>
          <h2 style={{ 
            color: "var(--text-primary)", 
            borderBottom: "2px solid var(--border-primary)", 
            paddingBottom: "8px",
            marginBottom: "20px"
          }}>
            Conventional Routes
          </h2>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", 
            gap: "12px"
          }}>
            {routes && Object.entries(routes)
              .filter(([routeNumber]) => routeNumber >= 1 && routeNumber <= 199)
              .map(([routeNumber, routeName]) => (
                <button
                  key={routeNumber}
                  className="route-button"
                  style={{
                    padding: "12px 16px",
                    border: "1px solid var(--border-primary)",
                    borderRadius: "8px",
                    background: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: "14px",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "var(--bg-primary)";
                    e.target.style.borderColor = "var(--border-secondary)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "var(--bg-secondary)";
                    e.target.style.borderColor = "var(--border-primary)";
                  }}
                  onClick={() => navigate(`/route/${routeNumber}`, { 
                    state: { routeName: routeName } 
                  })}
                >
                  <strong>{routeName}</strong>
                </button>
              ))}
          </div>
        </div>

        {/* Special Routes (200-299) */}
        <div style={{ marginTop: "40px" }}>
          <h2 style={{ 
            color: "#ec4899", 
            borderBottom: "2px solid #ec4899", 
            paddingBottom: "8px",
            marginBottom: "20px"
          }}>
            Seasonal Specials
          </h2>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", 
            gap: "12px"
          }}>
            {routes && Object.entries(routes)
              .filter(([routeNumber]) => routeNumber >= 200 && routeNumber <= 299)
              .map(([routeNumber, routeName]) => (
                <button
                  key={routeNumber}
                  className="route-button"
                  style={{
                    padding: "12px 16px",
                    border: "1px solid var(--border-primary)",
                    borderRadius: "8px",
                    background: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: "14px",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "var(--bg-primary)";
                    e.target.style.borderColor = "var(--border-secondary)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "var(--bg-secondary)";
                    e.target.style.borderColor = "var(--border-primary)";
                  }}
                  onClick={() => navigate(`/route/${routeNumber}`, { 
                    state: { routeName: routeName } 
                  })}
                >
                  <strong style={{ color: "#ec4899" }}>{routeName}</strong>
                </button>
              ))}
          </div>
        </div>

        {/* Night Routes (300-399) */}
        <div style={{ marginTop: "40px" }}>
          <h2 style={{ 
            color: "#3b82f6", 
            borderBottom: "2px solid #3b82f6", 
            paddingBottom: "8px",
            marginBottom: "20px"
          }}>
            Blue Night Network
          </h2>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", 
            gap: "12px"
          }}>
            {routes && Object.entries(routes)
              .filter(([routeNumber]) => routeNumber >= 300 && routeNumber <= 399)
              .map(([routeNumber, routeName]) => (
                <button
                  key={routeNumber}
                  className="route-button"
                  style={{
                    padding: "12px 16px",
                    border: "1px solid var(--border-primary)",
                    borderRadius: "8px",
                    background: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: "14px",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "var(--bg-primary)";
                    e.target.style.borderColor = "var(--border-secondary)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "var(--bg-secondary)";
                    e.target.style.borderColor = "var(--border-primary)";
                  }}
                  onClick={() => navigate(`/route/${routeNumber}`, { 
                    state: { routeName: routeName } 
                  })}
                >
                  <strong style={{ color: "#3b82f6" }}>{routeName}</strong>
                </button>
              ))}
          </div>
        </div>

        {/* Express Routes (900-999) */}
        <div style={{ marginTop: "40px" }}>
          <h2 style={{ 
            color: "#10b981", 
            borderBottom: "2px solid #10b981", 
            paddingBottom: "8px",
            marginBottom: "20px"
          }}>
            Express Network
          </h2>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", 
            gap: "12px"
          }}>
            {routes && Object.entries(routes)
              .filter(([routeNumber]) => routeNumber >= 900 && routeNumber <= 999)
              .map(([routeNumber, routeName]) => (
                <button
                  key={routeNumber}
                  className="route-button"
                  style={{
                    padding: "12px 16px",
                    border: "1px solid var(--border-primary)",
                    borderRadius: "8px",
                    background: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: "14px",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "var(--bg-primary)";
                    e.target.style.borderColor = "var(--border-secondary)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "var(--bg-secondary)";
                    e.target.style.borderColor = "var(--border-primary)";
                  }}
                  onClick={() => navigate(`/route/${routeNumber}`, { 
                    state: { routeName: routeName } 
                  })}
                >
                  <strong style={{ color: "#10b981" }}>{routeName}</strong>
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
