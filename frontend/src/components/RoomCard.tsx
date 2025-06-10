"use client";
import React, { useState, useEffect } from "react";
import { RoomCardProps, DeviceMetric } from "./types";
import DeviceItem from "./DeviceItem";
import { fetchDeviceMetrics, updateRoomIlluminance } from "./api";
import { useNotification } from "./NotificationContext";
import styles from "./InputDesign.module.css";

const RoomCard: React.FC<RoomCardProps> = ({
  room,
  onEditRoom,
  onDeleteRoom,
  onDeviceClick,
  onToggleDevice,
  onDropDevice,
}) => {
  const [targetIlluminance, setTargetIlluminance] = useState<number>(
    room.target_illuminance || 500,
  );
  const [isUpdatingIlluminance, setIsUpdatingIlluminance] =
    useState<boolean>(false);
  const [isDropTarget, setIsDropTarget] = useState<boolean>(false);
  const [illuminanceData, setIlluminanceData] = useState<DeviceMetric[]>([]);
  const [deviceMetricsData, setDeviceMetricsData] = useState<DeviceMetric[]>([]);
  const [historyPeriod, setHistoryPeriod] = useState<string>("24h");
  const [lastDataRefresh, setLastDataRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const { addNotification } = useNotification();

  // Fetch illuminance data when period changes or when room changes
  useEffect(() => {
    const fetchIlluminanceData = async () => {
      const sensor = room.devices.find((device) => device.type === "sensor");
      if (!sensor) return;

      try {
        setIsRefreshing(true);

        // Calculate date range based on selected period
        const endTime = new Date();
        let startTime = new Date();

        switch (historyPeriod) {
          case "24h":
            startTime.setDate(startTime.getDate() - 1);
            break;
          case "7d":
            startTime.setDate(startTime.getDate() - 7);
            break;
          case "30d":
            startTime.setDate(startTime.getDate() - 30);
            break;
          default:
            startTime.setDate(startTime.getDate() - 1);
        }

        const data = await fetchDeviceMetrics(
          sensor.id,
          startTime.toISOString(),
          endTime.toISOString(),
        );

        setIlluminanceData(data);
        setLastDataRefresh(new Date());

        // TODO update bulbs brightnesses
        const bulbs = room.devices.filter((device) => device.type === "bulb");
        // bulbs.forEach(bulb => bulb.name = "hello");

      } catch (error) {
        console.error("Error fetching illuminance data:", error);
      } finally {
        setIsRefreshing(false);
      }
    };

    fetchIlluminanceData();

    // Set up interval for regular updates (every 60 seconds)
    const intervalId = setInterval(fetchIlluminanceData, 60000);

    // Clean up interval on component unmount or when dependencies change
    return () => clearInterval(intervalId);
  }, [room.id, historyPeriod, room.devices]);

  return (
    <div className={styles.roomCard} key={room.id} data-room-id={room.id}>
      <div className={styles.roomHeader}>
        <h2 className={styles.roomTitle}>{room.name}</h2>
        <div className={styles.roomActions}>
          <button
            className={styles.editButton}
            onClick={() => onEditRoom(room)}
            aria-label={`Edit ${room.name}`}
          >
            Edit
          </button>
          <button
            className={styles.deleteButton}
            onClick={() => onDeleteRoom(room)}
            aria-label={`Delete ${room.name}`}
          >
            Delete
          </button>
        </div>
      </div>
      <div className={styles.activePeriod}>
        <label className={styles.sectionLabel}>Active Period: {room.start_time} to {room.end_time}</label>
        {/*<div className={styles.timeRange}>*/}
        {/*  <span>{room.start_time}</span>*/}
        {/*  <span>to</span>*/}
        {/*  <span>{room.end_time}</span>*/}
        {/*</div>*/}
      </div>
      <div className={styles.illuminanceSection}>
        <h3 className={styles.sectionTitle}>Target Illuminance</h3>
        <div className={styles.illuminanceControl}>
          <input
            className={styles.illuminanceSlider}
            type="range"
            min="0"
            max="1000"
            value={targetIlluminance}
            onChange={(e) => setTargetIlluminance(parseInt(e.target.value))}
            onMouseUp={async () => {
              try {
                setIsUpdatingIlluminance(true);
                await updateRoomIlluminance(room.id, targetIlluminance);
                setTargetIlluminance(targetIlluminance);
                addNotification(
                  "success",
                  `Target illuminance updated to ${targetIlluminance} lux`,
                );
              } catch (error) {
                console.error("Failed to update target illuminance:", error);
                // Revert to original value if update fails
                setTargetIlluminance(room.target_illuminance || 500);
                addNotification(
                  "error",
                  `Failed to update target illuminance: ${error instanceof Error ? error.message : "Unknown error"}`,
                );
              } finally {
                setIsUpdatingIlluminance(false);
              }
            }}
            onTouchEnd={async () => {
              try {
                setIsUpdatingIlluminance(true);
                await updateRoomIlluminance(room.id, targetIlluminance);
                addNotification(
                  "success",
                  `Target illuminance updated to ${targetIlluminance} lux`,
                );
              } catch (error) {
                console.error("Failed to update target illuminance:", error);
                // Revert to original value if update fails
                setTargetIlluminance(room.target_illuminance || 500);
                addNotification(
                  "error",
                  `Failed to update target illuminance: ${error instanceof Error ? error.message : "Unknown error"}`,
                );
              } finally {
                setIsUpdatingIlluminance(false);
              }
            }}
            aria-label="Target illuminance"
          />
          <span className={styles.illuminanceValue}>
            {targetIlluminance} lux{" "}
            {isUpdatingIlluminance && <small>(saving...)</small>}
          </span>
        </div>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Illuminance History</h3>
          {room.devices.some((device) => device.type === "sensor") && (
            <select
              className={styles.historyPeriod}
              aria-label="Select history period"
              value={historyPeriod}
              onChange={(e) => setHistoryPeriod(e.target.value)}
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
          )}
        </div>
        {room.devices.some((device) => device.type === "sensor") ? (
          <div className={styles.historyChart}>
            {isRefreshing && (
              <div className={styles.refreshIndicator}>
                <div className={styles.refreshSpinner}></div>
              </div>
            )}
            <div
              className={styles.targetLine}
              style={{
                top: `${100 - (targetIlluminance / 1000) * 100}%`,
              }}
            />
            {illuminanceData.length > 0 && (
              <div className={styles.chartData}>
                {illuminanceData.map((dataPoint, index) => {
                  const height = (dataPoint.value / 1000) * 100;
                  const width = 100 / illuminanceData.length;
                  const left = index * width;

                  return (
                    <div
                      key={dataPoint.timestamp}
                      className={styles.dataBar}
                      style={{
                        height: `${height}%`,
                        width: `${width}%`,
                        left: `${left}%`,
                        bottom: 0,
                      }}
                      title={`${new Date(dataPoint.timestamp).toLocaleString()}: ${dataPoint.value} lux`}
                    />
                  );
                })}
              </div>
            )}
            <div className={styles.lastUpdated}>
              Last updated: {lastDataRefresh.toLocaleTimeString()}
            </div>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyStateIcon}>📊</span>
            <p>
              Please assign an illuminance sensor to this room to view
              historical data
            </p>
          </div>
        )}
      </div>
      <div
        className={`${styles.devicesContainer} ${isDropTarget ? styles.dropTarget : ""}`}
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
          onDropDevice(e, room.id);
        }}
      >
        <h3 className={styles.sectionTitle}>Devices</h3>
        <div className={styles.devicesList}>
          {room.devices?.length > 0 ? (
            room.devices.map((device) => (
              <DeviceItem
                key={device.id}
                device={device}
                room={room}
                onDeviceClick={onDeviceClick}
                onToggleDevice={onToggleDevice}
                onDragStart={(e) => {
                  e.dataTransfer.setData("deviceId", device.id.toString());
                  e.dataTransfer.setData("sourceRoomId", room.id.toString());
                }}
              />
            ))
          ) : (
            <div className={styles.emptyState}>
              <p>No devices in this room. Drag devices here to add them.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
