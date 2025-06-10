"use client";
import React, { useState } from "react";
import { UnassignedDevicesProps } from "./types";
import styles from "./InputDesign.module.css";

const UnassignedDevices: React.FC<UnassignedDevicesProps> = ({
  devices,
  onRefresh,
  onAddDevice,
  onDeviceDrop,
  onDeviceDrag,
  onToggleDevice,
  onDeviceClick,
}) => {
  const [isDropTarget, setIsDropTarget] = useState<boolean>(false);

  return (
    <section
      className={`${styles.unassignedSection} ${isDropTarget ? styles.dropTarget : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDropTarget(true);
      }}
      onDragLeave={(e) => {
        // Only set to false if we're leaving the container (not entering a child)
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;

        if (
          x <= rect.left ||
          x >= rect.right ||
          y <= rect.top ||
          y >= rect.bottom
        ) {
          setIsDropTarget(false);
        }
      }}
      onDrop={(e) => {
        setIsDropTarget(false);
        onDeviceDrop(e);
      }}
    >
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Unassigned Devices</h2>
        <div className={styles.sectionActions}>
          <button
            className={styles.refreshButton}
            onClick={onRefresh}
            aria-label="Refresh unassigned devices"
          >
            Refresh
          </button>
          <button
            className={styles.addDeviceButton}
            onClick={onAddDevice}
            aria-label="Add new device"
          >
            Add Device
          </button>
        </div>
      </div>
      <div className={styles.unassignedGrid}>
        {devices?.length > 0 ? (
          devices.map((device) => (
            <div
              className={styles.unassignedDevvice}
              key={device.id}
              draggable
              onDragStart={(e) => onDeviceDrag(e, device.id)}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.opacity = "0.5";
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.opacity = "";
              }}
              onDragEnd={(e) => {
                // Reset all styles
                e.currentTarget.style.opacity = "";
                e.currentTarget.style.cursor = "";
                e.currentTarget.style.transform = "";
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
                    backgroundColor: device.is_on
                      ? "rgb(254, 240, 138)"
                      : "white",
                  }}
                  aria-label={`Toggle ${device.name} ${device.is_on ? "off" : "on"}`}
                >
                  💡
                </button>
              ) : (
                <div className={styles.deviceIcon}>📊</div>
              )}
              <div className={styles.unassignedDeviceInfo}>
                <button
                  className={styles.deviceName}
                  onClick={() => onDeviceClick(device)}
                >
                  {device.name}
                </button>
                <div className={styles.unassignedDeviceStatus}>
                  {device.type === "bulb" ? (
                    <span>{`Brightness: ${device.brightness || 0}%`}</span>
                  ) : (
                    <span>{`${device.value || 0} lux`}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <p>No unassigned devices available.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default UnassignedDevices;
