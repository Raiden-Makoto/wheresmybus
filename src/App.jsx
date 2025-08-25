import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";
import { Routes, Route, useNavigate } from "react-router-dom";
import StopPage from "./StopPage.jsx";
import { useTheme } from "./ThemeContext.jsx";

// Config
const DATA_URL = "https://api.npoint.io/96cc873ccf014e5cbd0c";
const FALLBACK = { lat: 43.6532, lng: -79.3832 };
const DEFAULT_RADIUS = 2000;

function FlyTo({ center }) {
  const map = useMap();
  const last = useRef(center);
  useEffect(() => {
    if (!last.current || last.current.lat !== center.lat || last.current.lng !== center.lng) {
      map.flyTo([center.lat, center.lng], Math.max(map.getZoom(), 15), { duration: 0.6 });
      last.current = center;
    }
  }, [center, map]);
  return null;
}

export default function App() {
  const [showModal, setShowModal] = useState(true);
  const [status, setStatus] = useState("Waiting…");
  const [stops, setStops] = useState(null);
  const [pos, setPos] = useState(null);
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [queryInput, setQueryInput] = useState("");

  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleSearchStop = () => {
    if (queryInput.trim()) {
      navigate(`/stop/${queryInput.trim()}`);
    }
  };

  // Load stops once
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(DATA_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setStops(json);
      } catch (e) {
        console.error("Failed to load stops:", e);
        setStops({});
      }
    })();
  }, []);



  // Modal actions
  const handleEnableLocation = () => {
    setShowModal(false);
    if (!("geolocation" in navigator)) {
      setStatus("Geolocation not supported — using default area");
      setPos(null);
      return;
    }
    setStatus("Locating…");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos({ lat: p.coords.latitude, lng: p.coords.longitude });
        setStatus("You are here");
      },
      () => {
        setStatus("Permission denied — using default area");
        setPos(null);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  };

  const handleNotNow = () => {
    setShowModal(false);
    setStatus("Location off — showing default area");
    setPos(null);
  };

  const center = useMemo(() => pos ?? FALLBACK, [pos]);

  // Filter stops by radius
  const nearbyStops = useMemo(() => {
    if (!stops) return [];
    const centerLL = L.latLng(center.lat, center.lng);
    const list = [];
    for (const [stopCode, value] of Object.entries(stops)) {
      const lat = Number(value.stop_lat);
      const lon = Number(value.stop_lon);
      const d = centerLL.distanceTo([lat, lon]);
      if (Number.isFinite(d) && d <= radius) {
        list.push({ stopCode, lat, lon, name: value.stop_name, dist: Math.round(d) });
      }
    }
    list.sort((a, b) => a.dist - b.dist);
    console.log(`Found ${list.length} stops within ${radius}m radius`);
    return list;
  }, [stops, center, radius]);

  return (
    <Routes>
      {/* Home (map) page */}
      <Route
        path="/"
        element={
          <div className="app-container">
            {/* Modal */}
            {showModal && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h3 className="modal-title">Enable location?</h3>
                  <p className="modal-description">
                    This app can center the map on your current location and show TTC bus stops within a 2km radius.
                  </p>
                  <div className="modal-actions">
                    <button onClick={handleNotNow} className="btn btn-secondary">
                      Not now
                    </button>
                    <button onClick={handleEnableLocation} className="btn btn-primary">
                      Enable location
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Menu bar */}
            <div className="menu-bar">
              <span className="status-text">
                {status} {nearbyStops.length > 0 && `• ${nearbyStops.length} stops found`}
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
              <button className="menu-button">
                Search by Route
              </button>
              <button className="theme-toggle" onClick={toggleTheme}>
                {theme === "light" ? "🌙" : "☀️"}
              </button>
            </div>

            {/* Map */}
            <MapContainer center={[center.lat, center.lng]} zoom={15} className="map-container" scrollWheelZoom>
              <TileLayer attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <FlyTo center={center} />
              <Marker 
                position={[center.lat, center.lng]}
                icon={L.divIcon({
                  className: 'custom-marker current-location',
                  html: `<svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 20 12 20s12-11 12-20c0-6.63-5.37-12-12-12zm0 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="#3b82f6"/>
                  </svg>`,
                  iconSize: [24, 32],
                  iconAnchor: [12, 32]
                })}
              >
                <Popup>{pos ? "You are here" : "Default area"}</Popup>
              </Marker>
              <Circle center={[center.lat, center.lng]} radius={radius} />
              {nearbyStops.map((s) => (
                <Marker 
                  key={s.stopCode} 
                  position={[s.lat, s.lon]}
                  icon={L.divIcon({
                    className: 'custom-marker bus-stop',
                    html: `<svg width="20" height="26" viewBox="0 0 20 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 0C4.48 0 0 4.48 0 10c0 7.5 10 16 10 16s10-8.5 10-16c0-5.52-4.48-10-10-10zm0 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" fill="#ef4444"/>
                    </svg>`,
                    iconSize: [20, 26],
                    iconAnchor: [10, 26]
                  })}
                >
                  <Popup>
                    <b>{s.stopCode}</b>
                    <br />{s.name}
                    <br /><small>{s.dist} m away</small>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        }
      />

      {/* Stop page */}
      <Route path="/stop/:stopCode" element={<StopPage stops={stops} />} />
    </Routes>
  );
}
