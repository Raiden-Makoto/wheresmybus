// StopPage.jsx
import { useParams } from "react-router-dom";
import "./App.css";

export default function StopPage({ stops }) {
  const { stopCode } = useParams(); // get code from /stop/:stopCode
  const stop = stops?.[stopCode];   // look up in stops data

  return (
    <div className="app-container">
      {/* Menu bar */}
      <div className="menu-bar">
        <span className="status-text">Viewing Stop</span>
        <input type="text" placeholder="Search..." className="search-input" />
        <button className="menu-button" disabled>Search for a Stop</button>
        <button className="menu-button" disabled>Search by Route</button>
        <button className="theme-toggle" disabled>🌙</button>
      </div>

      {/* Stop info */}
      <div style={{ padding: "20px" }}>
        {stop ? (
          <>
            <h2>Stop {stopCode}</h2>
            <p>{stop.stop_name}</p>
          </>
        ) : (
          <p>No stop found for code {stopCode}</p>
        )}
      </div>
    </div>
  );
}
