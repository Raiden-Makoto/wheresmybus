import { useState } from "react";
import "./App.css";

export default function ServiceAlerts() {
  const [isVisible, setIsVisible] = useState(false);

  const toggleAlerts = () => {
    setIsVisible(!isVisible);
  };

  const hideAlerts = () => {
    setIsVisible(false);
  };

  // Mock service alerts data - replace with real API data
  const alerts = [
    {
      id: 1,
      type: "warning",
      title: "Route 501 Queen - Delays",
      message: "Service delays of 10-15 minutes due to construction on Queen Street West.",
      timestamp: "2 hours ago"
    },
    {
      id: 2,
      type: "info",
      title: "Route 5 Avenue Road - Detour",
      message: "Buses are detouring via Dupont Street due to road closure at Avenue Road and Bloor Street.",
      timestamp: "4 hours ago"
    },
    {
      id: 3,
      type: "alert",
      title: "System-wide - Reduced Service",
      message: "Reduced service frequency on all routes due to staff shortages. Expect longer wait times.",
      timestamp: "6 hours ago"
    }
  ];

  return (
    <div className="alerts-dropdown">
      {/* View Alerts Button */}
      <button 
        className="alerts-toggle" 
        onClick={toggleAlerts}
        title={isVisible ? "Hide Service Alerts" : "View Service Alerts"}
      >
        {isVisible ? "Hide Alerts" : "View Alerts"}
      </button>

      {/* Dropdown Panel */}
      {isVisible && (
        <div className="alerts-dropdown-panel">
          <div className="alerts-header">
            <h3>Service Alerts</h3>
            <button className="alerts-close" onClick={hideAlerts} title="Close">
              ×
            </button>
          </div>
          <div className="alerts-content">
            {alerts.length === 0 ? (
              <p className="no-alerts">No current service alerts</p>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className={`alert-item alert-${alert.type}`}>
                  <div className="alert-header">
                    <span className="alert-type">
                      {alert.type === "warning" && "⚠️"}
                      {alert.type === "info" && "ℹ️"}
                      {alert.type === "alert" && "🚨"}
                    </span>
                    <span className="alert-title">{alert.title}</span>
                    <span className="alert-timestamp">{alert.timestamp}</span>
                  </div>
                  <p className="alert-message">{alert.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
