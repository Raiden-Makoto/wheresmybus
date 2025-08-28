// StopPage.jsx
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";
import { useTheme } from "./ThemeContext.jsx";
import ServiceAlerts from "./ServiceAlerts.jsx";
import { useState, useEffect } from "react";
import models from "../models.json";

export default function StopPage({ stops }) {
  const { stopCode } = useParams(); // get code from /stop/:stopCode
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const stop = stops?.[stopCode];   // look up in stops data
  
  const [stopData, setStopData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [selectedRoutes, setSelectedRoutes] = useState(new Set());

  const handleBackToMap = () => {
    navigate("/");
  };

  const handleSearchStop = () => {
    const trimmedSearch = searchInput.trim();
    if (trimmedSearch) {
      navigate(`/stop/${trimmedSearch}`);
    }
  };

  function getModel(vehicleId) {
    const id = Number(vehicleId);
    for (const range in models) {
      const [start, end] = range.split("-").map(Number);
      if (id >= start && id <= end) {
        return models[range];
      }
    }
    return "Unknown model";
  }

  // Component to update map center when stop changes
  function UpdateMapCenter({ center }) {
    const map = useMap();
    
    useEffect(() => {
      if (center && center[0] && center[1]) {
        map.setView(center, 16);
      }
    }, [center, map]);
    
    return null;
  }

  function addTimeAndDelay(timeStr, delayStr) {
    if (!timeStr || !delayStr) return "";
  
    // parse timeStr = "HH:MM:SS"
    const [h, m, s] = timeStr.split(":").map(x => parseInt(x, 10));
  
    // handle delayStr = "+MM:SS" or "-MM:SS"
    const isPositive = delayStr.startsWith("+");
    const clean = delayStr.replace("+", "").replace("-", "");
    const [dm, ds] = clean.split(":").map(x => parseInt(x, 10));
  
    if ([h, m, s, dm, ds].some(isNaN)) {
      console.warn("Bad time/delay input:", { timeStr, delayStr });
      return "";
    }
  
    // total delay in seconds
    const delaySeconds = dm * 60 + ds;
  
    // IMPORTANT: invert meaning
    // +delay = early → add to scheduled (bus arrives early)
    // -delay = late  → subtract from scheduled (bus arrives late)
    const signedDelay = isPositive ? delaySeconds : -delaySeconds;
  
    let totalSeconds = h * 3600 + m * 60 + s + signedDelay;
  
    // normalize into HH:MM:SS
    const hh = String(Math.floor(totalSeconds / 3600)).padStart(2, 0);
    const mm = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, 0);
    const ss = String(totalSeconds % 60).padStart(2, 0);
  
    return `${hh}:${mm}:${ss}`;
  }

  // Fetch stop data from /seek endpoint
  useEffect(() => {
    const fetchStopData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://42cummer-transseeapi.hf.space/seek`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ stop: stopCode })
        });
        if (!response.ok) {
          throw new Error('Failed to fetch stop data');
        }
        const data = await response.json();
        setStopData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching stop data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (stopCode) {
      fetchStopData();
    }
  }, [stopCode]);

  if (!stop) {
    return (
      <div className="app-container">
        <div className="menu-bar">
          <span className="status-text">Stop Not Found</span>
          <button className="menu-button" onClick={handleBackToMap}>
            Back to Map
          </button>
        </div>
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h2>Stop {stopCode} not found</h2>
          <p>This stop code doesn't exist in our database.</p>
        </div>
      </div>
    );
  }

  const stopLat = Number(stop.stop_lat);
  const stopLon = Number(stop.stop_lon);

  return (
    <div className="app-container">
      {/* Menu bar */}
      <div className="menu-bar">
        <span className="status-text">Viewing Stop {stopCode}</span>
        <input
          type="text"
          placeholder="Search..."
          className="search-input"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearchStop()}
        />
        <button className="menu-button" onClick={handleSearchStop}>
          Search for a Stop
        </button>
        <button className="menu-button" onClick={() => navigate('/routes')}>
          View All Routes
        </button>
        <button className="menu-button" onClick={handleBackToMap}>
          Back to Map
        </button>
        <ServiceAlerts />
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === "light" ? "🌙" : "☀️"}
        </button>
      </div>

      {/* Stop info */}
      <div style={{ padding: "20px 20px 00px 20px" }}>
        <h1>Stop {stopCode}: {stop.stop_name}</h1>
      </div>

      {/* Map showing stop location */}
      <div style={{ 
        height: "400px", 
        margin: "0 20px 20px 20px",
        border: "2px solid var(--border-primary)",
        borderRadius: "8px",
        overflow: "hidden",
        position: "relative"
      }}>
        <MapContainer 
          key={stopCode} // Force re-render when stop changes
          center={[stopLat, stopLon]} 
          zoom={16} 
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
        >
          <UpdateMapCenter center={[stopLat, stopLon]} />
          <TileLayer 
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
          />
          <Marker 
            position={[stopLat, stopLon]}
            icon={L.divIcon({
              className: 'custom-marker bus-stop',
              html: `<svg width="20" height="26" viewBox="0 0 20 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 0C4.48 0 0 4.48 0 10c0 7.5 10 16 10 16s10-8.5 10-16c0-5.52-4.48-10-10-10zm0 13c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" fill="#ef4444"/>
              </svg>`,
              iconSize: [20, 26],
              iconAnchor: [10, 26]
            })}
          >
            <Popup>
              <b>Stop {stopCode}</b><br />
              {stop.stop_name}
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Route Filter Checkboxes */}
      {stopData && stopData.routes && stopData.routes.length > 0 && (
        <div style={{ margin: "0 20px 20px 20px" }}>
          <h3 style={{ marginBottom: "12px", fontSize: "16px", color: "var(--text-secondary)" }}>
            Filter by Route:
          </h3>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "12px", 
            marginBottom: "20px"
          }}>
            {stopData.routes.map((route) => (
              <div key={route.name} style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "8px",
                padding: "12px 16px",
                background: "var(--bg-secondary)",
                borderRadius: "8px",
                border: "1px solid var(--border-primary)",
                cursor: "pointer"
              }}>
                <input
                  type="checkbox"
                  checked={selectedRoutes.has(route.name)}
                  onChange={(e) => {
                    const newSelected = new Set(selectedRoutes);
                    if (e.target.checked) {
                      newSelected.add(route.name);
                    } else {
                      newSelected.delete(route.name);
                    }
                    setSelectedRoutes(newSelected);
                  }}
                  style={{ cursor: "pointer" }}
                />
                <span style={{ 
                  fontSize: "14px", 
                  color: route.name.match(/^\d+/)?.[0] >= 200 && route.name.match(/^\d+/)?.[0] <= 299 ? '#ec4899' : 
                         route.name.match(/^\d+/)?.[0] >= 300 && route.name.match(/^\d+/)?.[0] <= 399 ? '#3b82f6' : 
                         route.name.match(/^\d+/)?.[0] >= 900 && route.name.match(/^\d+/)?.[0] <= 999 ? '#10b981' : 'var(--text-primary)'
                }}>
                  {route.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vehicle Cards */}
      <div style={{ margin: "0 20px 20px 20px" }}>
        <h2>Upcoming Departures</h2>
        {loading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <p>Loading stop information...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <p>Error: {error}</p>
          </div>
        ) : stopData && stopData.vehicles && stopData.vehicles.length > 0 ? (
          stopData.vehicles
            .filter(vehicle => {
              // If no routes are selected, show all vehicles
              if (selectedRoutes.size === 0) return true;
              // Otherwise, only show vehicles whose route matches a selected route
              return stopData.routes?.some(route => 
                route.name.startsWith(vehicle.route) && selectedRoutes.has(route.name)
              );
            })
            .map((vehicle, index) => (
            <div key={`${vehicle.route}-${vehicle.vehicle_number}-${index}`} className="vehicle-card">
              <div className="vehicle-info">
                <div className="vehicle-route">
                  {stopData.routes?.find(r => r.name.startsWith(vehicle.route))?.name || vehicle.route}
                </div>
                <div className="vehicle-time">
                  At {vehicle.actual} (<span className={vehicle.delay.startsWith("-") ? "delay-negative" : "delay-positive"}>
                    {vehicle.delay}
                  </span> | {addTimeAndDelay(vehicle.actual, vehicle.delay)})
                </div>
              </div>
              <div className="vehicle-meta">
                <div className="vehicle-btn">
                  {vehicle.vehicle_number}
                  {getModel(vehicle.vehicle_number).charging && <span style={{ marginLeft: '4px' }}>⚡</span>}
                </div>
                <div className="vehicle-model">
                  {getModel(vehicle.vehicle_number).model}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center", marginTop: "10px" }}>
            No upcoming departures found for this stop.
          </p>
        )}
      </div>
    </div>
  );
}
