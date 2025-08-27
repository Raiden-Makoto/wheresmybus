// RoutePage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useTheme } from "./ThemeContext.jsx";
import "./App.css";
import "./RoutePage.css"
import models from "../models.json";
import ServiceAlerts from "./ServiceAlerts.jsx";

export default function RoutePage() {
  const { routeNumber } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [queryInput, setQueryInput] = useState("");
  const [vehicles, setVehicles] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  
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

  const busIcon = L.icon({
    iconUrl: 'https://www.freeiconspng.com/uploads/red-bus-icon-8.png',
    iconSize: [28, 28], // Size of the icon
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  });

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
    // +delay = early → subtract from scheduled
    // -delay = late  → add to scheduled
    const signedDelay = isPositive ? -delaySeconds : delaySeconds;
  
    let totalSeconds = h * 3600 + m * 60 + s + signedDelay;
  
    // normalize into HH:MM:SS
    const hh = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const mm = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const ss = String(totalSeconds % 60).padStart(2, "0");
  
    return `${hh}:${mm}:${ss}`;
  }

  function FlyToVehicle({ vehicles, selectedVehicle }) {
    const map = useMap();
  
    useEffect(() => {
      if (!selectedVehicle || !vehicles) return;
  
      const v = vehicles.find(x => x.vehicle_id === selectedVehicle);
      if (v) {
        const latlng = L.latLng(v.latitude, v.longitude);
        map.flyTo(latlng, 17, { duration: 0.6 });
  
        // open popup
        const layer = Object.values(map._layers).find(
          l => l.getLatLng && l.getLatLng().equals(latlng)
        );
        if (layer) {
          layer.openPopup();
        }
      }
    }, [selectedVehicle, vehicles, map]);
  
    return null;
  }

  function FitBounds({ vehicles }) {
    const map = useMap();
  
    useEffect(() => {
      if (vehicles && vehicles.length > 0) {
        const bounds = L.latLngBounds(
          vehicles.map(v => [v.latitude, v.longitude])
        );
        map.fitBounds(bounds, { padding: [10, 10] });
      }
    }, [vehicles, map]);
  
    return null;
  }

  useEffect(() => {
    const fetchVehicles = async () => {
        try {
            // Only show loading on initial fetch
            if (initialLoading) {
                setLoading(true);
            }
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
            setVehicles(data.vehicles);
            setInitialLoading(false); // Mark initial load as complete
        } catch (err) {
            console.error('Failed to fetch routes:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    // Initial fetch
    fetchVehicles();
    
    // Set up interval to fetch vehicles every minute
    const intervalId = setInterval(fetchVehicles, 60000); // 60000ms = 1 minute
    
    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [routeNumber]);

  if (initialLoading && loading) {
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
          <ServiceAlerts />
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
          <ServiceAlerts />
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
        <span className="status-text">
          Viewing Vehicles for {routeName}
          {!initialLoading && loading && <span style={{ marginLeft: '8px', opacity: 0.7 }}>🔄</span>}
        </span>
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
        <ServiceAlerts />
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
      </div>
      <div style={{ 
        height: "400px", 
        margin: "0 20px 20px 20px",
        border: "2px solid var(--border-primary)",
        borderRadius: "8px",
        overflow: "hidden",
        position: "relative"
    }}
    >
        {vehicles && vehicles.length > 0 ? (
            <MapContainer 
            center={[vehicles[0].latitude, vehicles[0].longitude]} 
            zoom={14} 
            style={{ height: "100%", width: "100%" }}
            >
            <TileLayer 
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
            />
            {vehicles.map((v) => (
                <Marker 
                key={v.vehicleId}
                position={[v.latitude, v.longitude]}
                icon={busIcon}
                >
                <Popup>
                    <b>Vehicle {v.vehicle_id}</b>
                    <br/>{v.destination}
                </Popup>
                </Marker>
            ))}
            <FitBounds vehicles={vehicles} />
            <FlyToVehicle vehicles={vehicles} selectedVehicle={selectedVehicle} />
            </MapContainer>
        ) : (
            <div style={{ padding: "20px", textAlign: "center" }}>
            <p>No vehicles currently found for this route.</p>
            </div>
        )}
    </div>
    <div style={{ margin: "0 20px 20px 20px" }}>
        {vehicles && vehicles.length > 0 ? (
            vehicles.map((v) => (
            <div key={v.vehicle_id} className="vehicle-card">
                <div className="vehicle-info">
                <div className="vehicle-route">
                    {routeNumber}{v.branch ? v.branch : ""} {v.destination}
                </div>
                <div className="vehicle-time">
                    <span className={v.delay.startsWith("-") ? "delay-negative" : "delay-positive"}>
                    {v.delay} ({v.delay.startsWith("-") ? "delayed" : "early"})
                    </span>
                </div>
                </div>
                <div className="vehicle-meta">
                <button
                    className="vehicle-btn"
                    onClick={() => setSelectedVehicle(v.vehicle_id)}
                >
                    {v.vehicle_id}
                    {getModel(v.vehicle_id).charging && <span style={{ marginLeft: '4px' }}>⚡</span>}
                </button>
                <div className="vehicle-model">{getModel(v.vehicle_id).model}</div>
                </div>
            </div>
            ))
        ) : (
            <p style={{ textAlign: "center", marginTop: "10px" }}>
            No vehicles currently found for this route.
            </p>
        )}
        </div>
    </div>
  );
}
