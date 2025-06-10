"use client";
import React from "react";
import { useNotification } from "./NotificationContext";
import Notification from "./Notification";
import styles from "./InputDesign.module.css";

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className={styles.notificationContainer}>
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onClose={removeNotification}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;
