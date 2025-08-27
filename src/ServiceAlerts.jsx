import { useState, useEffect } from "react";
import "./App.css";

export default function ServiceAlerts() {
  const [isVisible, setIsVisible] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notificationDismissed, setNotificationDismissed] = useState(() => {
    // Check if notification was already shown in this session
    return sessionStorage.getItem('alertsNotificationShown') === 'true';
  });


  const toggleAlerts = () => {
    setIsVisible(!isVisible);
  };

  const hideAlerts = () => {
    setIsVisible(false);
  };

  // Fetch alerts from API
  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching alerts from:', 'https://42cummer-transseeapi.hf.space/alerts');
        const response = await fetch('https://42cummer-transseeapi.hf.space/alerts');
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const alertsData = await response.json();
        console.log('Alerts data received:', alertsData);
        
        // Process alerts with type logic
        const processedAlerts = alertsData.map((alert, index) => {
          let alertType = 'info'; // default type
          
          // If route contains "shuttle bus" use alert
          if (alert.route && alert.route.toLowerCase().includes('shuttle bus')) {
            alertType = 'alert';
          }
          // If title contains detour use alert
          else if (alert.title && alert.title.toLowerCase().includes('detour')) {
            alertType = 'warning';
          }
          // else use info
          
          return {
            id: index + 1,
            type: alertType,
            title: alert.title || 'No Title',
            message: alert.title || 'No message available', // title is the message
            route: alert.route
          };
        });
        
        setAlerts(processedAlerts);
        
        // Show browser confirm dialog if there are alerts and user hasn't dismissed it
        if (processedAlerts.length > 0 && !notificationDismissed) {
          const userChoice = window.confirm('There are service advisories affecting your commute. Would you like to view them?');
          if (userChoice) {
            setIsVisible(true);
          }
          // Mark as dismissed for this session
          setNotificationDismissed(true);
          sessionStorage.setItem('alertsNotificationShown', 'true');
        }
      } catch (err) {
        console.error('Failed to fetch alerts:', err);
        setError('Failed to load service alerts');
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, []);

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
            {loading ? (
              <p className="no-alerts">Loading alerts...</p>
            ) : error ? (
              <p className="no-alerts">{error}</p>
            ) : alerts.length === 0 ? (
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
                    <p className="alert-message">{alert.title}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
