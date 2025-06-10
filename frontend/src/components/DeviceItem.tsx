import React from "react";
import { DeviceItemProps } from "./types";
import styles from "./InputDesign.module.css";

const DeviceItem: React.FC<DeviceItemProps> = ({
  device,
  onDeviceClick,
  onToggleDevice,
  draggable = true,
  onDragStart,
}) => {
  return (
    <div
      className={styles.deviceItem}
      key={device.id}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={(e) => {
        e.preventDefault();
        e.currentTarget.style.opacity = "0.5";
        e.currentTarget.style.transform = "scale(0.95)";
      }}
      onDragLeave={(e) => {
        e.currentTarget.style.opacity = "1";
        e.currentTarget.style.transform = "scale(1)";
      }}
      onDragEnd={(e) => {
        // Reset all styles
        e.currentTarget.style.opacity = "";
        e.currentTarget.style.cursor = "";
        e.currentTarget.style.transform = "";

        // Also reset any other dragged elements that might not have been properly reset
        const draggedElements = document.querySelectorAll(
          `.${styles.deviceItem}, .${styles.unassignedDevvice}`,
        );
        draggedElements.forEach((el) => {
          if (el !== e.currentTarget) {
            // el.style.opacity = "";
            // el.style.transform = "";
            // el.style.cursor = "";
          }
        });
      }}
    >
      {device.type === "bulb" ? (
        <button
          className={styles.deviceToggle}
          onClick={(e) => {
            e.stopPropagation();
            onToggleDevice(device);
          }}
          style={{
            backgroundColor: device.is_on ? "rgb(254, 240, 138)" : "white",
          }}
          aria-label={`Toggle ${device.name} ${device.is_on ? "off" : "on"}`}
        >
          💡
        </button>
      ) : (
        <div className={styles.deviceIcon}>📊</div>
      )}
      <div className={styles.deviceInfo}>
        <button
          className={styles.deviceName}
          onClick={() => onDeviceClick(device)}
        >
          {device.name}
        </button>
        <div className={styles.deviceStatus}>
          {device.type === "bulb" ? (
            <span>{`Brightness: ${device.brightness || 0}%`}</span>
          ) : (
            <span>{`${device.value || 0} lux`}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeviceItem;
