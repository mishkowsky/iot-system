"use client";
import React, { useState, useEffect } from "react";
import { Notification as NotificationType } from "./NotificationContext";
import styles from "./InputDesign.module.css";

interface NotificationProps {
  notification: NotificationType;
  onClose: (id: string) => void;
}

const Notification: React.FC<NotificationProps> = ({
  notification,
  onClose,
}) => {
  const [isExiting, setIsExiting] = useState(false);

  // Handle close with animation
  const handleClose = () => {
    setIsExiting(true);
    // Wait for animation to complete before removing
    setTimeout(() => {
      onClose(notification.id);
    }, 300); // Match this with CSS animation duration
  };

  // Set up auto-close timer
  useEffect(() => {
    if (notification.duration && notification.duration !== Infinity) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          onClose(notification.id);
        }, 300);
      }, notification.duration - 300); // Subtract animation time

      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  // Get icon based on notification type
  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "⚠";
      case "info":
        return "ℹ";
      default:
        return "";
    }
  };

  return (
    <div
      className={`${styles.notification} ${styles[`notification${notification.type}`]} ${isExiting ? styles.notificationExit : styles.notificationEnter}`}
      role="alert"
    >
      <div className={styles.notificationIcon}>{getIcon()}</div>
      <div className={styles.notificationContent}>
        <p>{notification.message}</p>
      </div>
      <button
        className={styles.notificationClose}
        onClick={handleClose}
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
};

export default Notification;
