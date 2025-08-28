// RouteList.jsx
import { useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeContext.jsx";
import { useState, useEffect } from "react";
import "./App.css";
import ServiceAlerts from "./ServiceAlerts.jsx";

export default function RouteList() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [routes, setRoutes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [queryInput, setQueryInput] = useState("");   // search input

  const handleBackToMap = () => {
    navigate("/");
  };

  // Fetch routes from API or cache
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        // Only show loading on initial fetch
        if (initialLoading) {
          setLoading(true);
        }
        
        // Check if routes are cached in localStorage
        const cachedRoutes = localStorage.getItem('cachedRoutes');
        const cacheTimestamp = localStorage.getItem('routesCacheTimestamp');
        const cacheAge = cacheTimestamp ? Date.now() - parseInt(cacheTimestamp) : Infinity;
        
        // Use cached routes if they're less than 24 hours old
        if (cachedRoutes && cacheAge < 24 * 60 * 60 * 1000) {
          console.log('Using cached routes (age:', Math.round(cacheAge / 1000 / 60), 'minutes)');
          setRoutes(JSON.parse(cachedRoutes));
          setInitialLoading(false);
          setLoading(false);
          return;
        }
        
        // Fetch fresh routes from API
        console.log('Fetching fresh routes from API');
        const response = await fetch("https://42cummer-transseeapi.hf.space/routelist");
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        
        // Cache the routes with timestamp
        localStorage.setItem('cachedRoutes', JSON.stringify(data));
        localStorage.setItem('routesCacheTimestamp', Date.now().toString());
        
        setRoutes(data);
        setInitialLoading(false); // Mark initial load as complete
      } catch (err) {
        console.error("Failed to fetch routes:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  // Apply filtering (contains search)
  const filteredRoutes = routes
    ? Object.entries(routes).filter(([routeNumber, routeName]) => {
        const searchTerm = queryInput.trim().toLowerCase();
        return routeNumber.toString().toLowerCase().includes(searchTerm) ||
               routeName.toLowerCase().includes(searchTerm);
      })
    : [];

  if (initialLoading && loading) {
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
          <ServiceAlerts />
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
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
        />
        <button className="menu-button">Search by Route</button>
        <button className="menu-button" onClick={handleBackToMap}>
          Back to Map
        </button>
        <ServiceAlerts />
        {/* <button 
          className="menu-button" 
          onClick={() => {
            // Clear cached routes and force refresh
            localStorage.removeItem('cachedRoutes');
            localStorage.removeItem('routesCacheTimestamp');
            window.location.reload();
          }}
          style={{ 
            background: '#dc2626', 
            borderColor: '#dc2626',
            fontSize: '11px',
            padding: '6px 8px'
          }}
        >
          🔄 Debug Refresh
        </button> */}
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "light" ? "🌙" : "☀️"}
        </button>
      </div>

      {/* Content area */}
      <div style={{ padding: "20px" }}>
        {/* Conventional Routes (1-199) */}
        <div style={{ marginTop: "30px" }}>
          <h2
            style={{
              color: "var(--text-primary)",
              borderBottom: "2px solid var(--border-primary)",
              paddingBottom: "8px",
              marginBottom: "20px",
            }}
          >
            Conventional Routes
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "12px",
            }}
          >
            {filteredRoutes
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
                    transition: "all 0.2s ease",
                  }}
                  onClick={() =>
                    navigate(`/route/${routeNumber}`, { state: { routeName } })
                  }
                >
                  <strong>{routeName}</strong>
                </button>
              ))}
          </div>
        </div>

        {/* Seasonal Specials (200-299) */}
        <div style={{ marginTop: "40px" }}>
          <h2
            style={{
              color: "#ec4899",
              borderBottom: "2px solid #ec4899",
              paddingBottom: "8px",
              marginBottom: "20px",
            }}
          >
            Seasonal Specials
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "12px",
            }}
          >
            {filteredRoutes
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
                    transition: "all 0.2s ease",
                  }}
                  onClick={() =>
                    navigate(`/route/${routeNumber}`, { state: { routeName } })
                  }
                >
                  <strong style={{ color: "#ec4899" }}>{routeName}</strong>
                </button>
              ))}
          </div>
        </div>

        {/* Blue Night Network (300-399) */}
        <div style={{ marginTop: "40px" }}>
          <h2
            style={{
              color: "#3b82f6",
              borderBottom: "2px solid #3b82f6",
              paddingBottom: "8px",
              marginBottom: "20px",
            }}
          >
            Blue Night Network
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "12px",
            }}
          >
            {filteredRoutes
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
                    transition: "all 0.2s ease",
                  }}
                  onClick={() =>
                    navigate(`/route/${routeNumber}`, { state: { routeName } })
                  }
                >
                  <strong style={{ color: "#3b82f6" }}>{routeName}</strong>
                </button>
              ))}
          </div>
        </div>

        {/* Streetcar (500-599) */}
        <div style={{ marginTop: "40px" }}>
          <h2
            style={{
              color: "#f59e0b",
              borderBottom: "2px solid #f59e0b",
              paddingBottom: "8px",
              marginBottom: "20px",
            }}
          >
            Streetcar
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "12px",
            }}
          >
            {filteredRoutes
              .filter(([routeNumber]) => routeNumber >= 500 && routeNumber <= 599)
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
                    transition: "all 0.2s ease",
                  }}
                  onClick={() =>
                    navigate(`/route/${routeNumber}`, { state: { routeName } })
                  }
                >
                  <strong style={{ color: "#f59e0b" }}>
                    {routeNumber >= 500 && routeNumber <= 599 ? routeName.slice(0, -1) : routeName}
                  </strong>
                </button>
              ))}
          </div>
        </div>

        {/* Express Network (900-999) */}
        <div style={{ marginTop: "40px" }}>
          <h2
            style={{
              color: "#10b981",
              borderBottom: "2px solid #10b981",
              paddingBottom: "8px",
              marginBottom: "20px",
            }}
          >
            Express Network
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "12px",
            }}
          >
            {filteredRoutes
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
                    transition: "all 0.2s ease",
                  }}
                  onClick={() =>
                    navigate(`/route/${routeNumber}`, { state: { routeName } })
                  }
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
