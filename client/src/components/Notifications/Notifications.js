import React, { useState, useEffect, useCallback } from "react";
import { SERVER_URL } from "../../App";
import "./Notifications.css"; // Import the CSS file

const Notifications = () => {
  const [notifications, setNotifications] = useState([]); // Holds the notifications data
  const [loading, setLoading] = useState(true); // Loading state for API call
  const [error, setError] = useState(null); // Holds error message if API call fails

  // Get role and userId from localStorage
  const role = localStorage.getItem("role");
  const userId =
    role === "customer"
      ? localStorage.getItem("Customer_ID")
      : localStorage.getItem("Employee_ID");

  // Fetch notifications from backend (defined with useCallback to avoid re-creation)
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null); // Reset error before new fetch
    try {
      const response = await fetch(
        `${SERVER_URL}/api/notifications?userId=${userId}&userType=${role}`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch notifications. Status: ${response.status}`);
      }
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError("Failed to load notifications. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [userId, role]); // Dependencies for useCallback

  // Fetch notifications on component load
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]); // Dependencies for useEffect

  // Loading state
  if (loading) return <p>Loading notifications...</p>;

  // Error state
  if (error) return <p className="error-message">{error}</p>;

  // Render notifications
  return (
    <div className="notifications-container">
      <h2 className="notifications-header">Notifications</h2>
      {notifications.length > 0 ? (
        <ul className="notifications-list">
          {notifications.map((notification, index) => (
            <li key={index} className="notification-item">
              <p className="notification-message">{notification.Message}</p>
              <p className="notification-timestamp">
                {new Date(notification.Created_At).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-notifications">No notifications available</p>
      )}
      {/* Button to refresh notifications */}
      <button onClick={fetchNotifications} className="refresh-button">
        Refresh Notifications
      </button>
    </div>
  );
};

export default Notifications;

