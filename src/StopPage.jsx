// StopPage.jsx
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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
          Search by Route
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
          center={[stopLat, stopLon]} 
          zoom={16} 
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
        >
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
          stopData.vehicles.map((vehicle, index) => (
            <div key={`${vehicle.route}-${vehicle.vehicle_number}-${index}`} className="vehicle-card">
              <div className="vehicle-info">
                <div className="vehicle-route">
                  {vehicle.route}{vehicle.branch ? vehicle.branch : ""} {vehicle.destination}
                </div>
                <div className="vehicle-time">
                  {vehicle.scheduled} (<span className={vehicle.delay.startsWith("-") ? "delay-negative" : "delay-positive"}>
                    {vehicle.delay}
                  </span> | {vehicle.actual})
                </div>
              </div>
              <div className="vehicle-meta">
                <div className="vehicle-btn">
                  {vehicle.vehicle_number}
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
