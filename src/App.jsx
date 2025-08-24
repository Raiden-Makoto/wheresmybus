import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";

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
  const [theme, setTheme] = useState("light");

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

  // Theme management
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

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
        <button className="menu-button">
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
            html: '📍',
            iconSize: [24, 24],
            iconAnchor: [12, 24]
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
              html: '📍',
              iconSize: [20, 20],
              iconAnchor: [10, 20]
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
      
      {/* Map attribution footer */}
      <div className="map-attribution">
        © OpenStreetMap contributors • Data provided by OpenStreetMap
      </div>
    </div>
  );
}
