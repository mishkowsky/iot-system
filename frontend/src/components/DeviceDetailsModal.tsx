"use client";
import React, { useState, useEffect } from "react";
import { DeviceDetailsModalProps, Device, DeviceMetric } from "./types";
import Modal from "./Modal";
import {
  fetchDeviceDetails,
  fetchDeviceMetrics,
  updateDevice,
  deleteDevice,
} from "./api";
import { useNotification } from "./NotificationContext";
import styles from "./InputDesign.module.css";

const DeviceDetailsModal: React.FC<DeviceDetailsModalProps> = ({
  device,
  onClose,
  onDelete,
}) => {
  const [metricsData, setMetricsData] = useState<DeviceMetric[]>([]);
  const [historyPeriod, setHistoryPeriod] = useState<string>("24h");
  const [lastDataRefresh, setLastDataRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [deviceDetails, setDeviceDetails] = useState<Device>(device);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [newDeviceName, setNewDeviceName] = useState<string>(device.name);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    useState<boolean>(false);
  const { addNotification } = useNotification();

  // Fetch device metrics when period changes or when device changes
  useEffect(() => {
    const fetchDeviceData = async () => {
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

        // Fetch latest device details
        try {
          const updatedDevice = await fetchDeviceDetails(device.id);
          setDeviceDetails(updatedDevice);
          setNewDeviceName(updatedDevice.name);
        } catch (error) {
          console.error("Error fetching device details:", error);
        }

        // Fetch metrics data
        const data = await fetchDeviceMetrics(
          device.id,
          startTime.toISOString(),
          endTime.toISOString(),
        );

        setMetricsData(data);
        setLastDataRefresh(new Date());
      } catch (error) {
        console.error("Error fetching device metrics:", error);
      } finally {
        setIsRefreshing(false);
      }
    };

    fetchDeviceData();

    // Set up interval for regular updates (every 15 seconds)
    const intervalId = setInterval(fetchDeviceData, 15000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [device.id, historyPeriod]);

  const handleSaveName = async () => {
    if (newDeviceName.trim() === "") {
      addNotification("error", "Device name cannot be empty");
      return;
    }

    try {
      setIsSaving(true);
      await updateDevice(deviceDetails.id, {
        ...deviceDetails,
        name: newDeviceName,
      });

      // Update local state
      setDeviceDetails({
        ...deviceDetails,
        name: newDeviceName,
      });

      setIsEditingName(false);
      addNotification("success", "Device name updated successfully");
    } catch (error) {
      console.error("Error updating device name:", error);
      addNotification(
        "error",
        `Failed to update device name: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDevice = async () => {
    try {
      setIsDeleting(true);
      await deleteDevice(deviceDetails.id);
      addNotification(
        "success",
        `Device "${deviceDetails.name}" deleted successfully`,
      );
      onDelete(deviceDetails.id);
      onClose();
    } catch (error) {
      console.error("Error deleting device:", error);
      addNotification(
        "error",
        `Failed to delete device: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
    }
  };

  return (
    <Modal title="Device Details" onClose={onClose}>
      {showDeleteConfirmation ? (
        <div className={styles.deleteConfirmation}>
          <p className={styles.confirmationText}>
            Are you sure you want to delete this device? This action cannot be
            undone.
          </p>
          <div className={styles.modalActions}>
            <button
              className={styles.cancelButton}
              onClick={() => setShowDeleteConfirmation(false)}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              className={styles.deleteButton}
              onClick={handleDeleteDevice}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Device"}
            </button>
          </div>
        </div>
      ) : (
          <div className={styles.deviceDetails}>
            <div className={styles.detailField}>
              <label className={styles.detailLabel}>Name</label>
              {isEditingName ? (
                  <div className={styles.editNameContainer}>
                    <input
                        type="text"
                        className={styles.formInput}
                        value={newDeviceName}
                        onChange={(e) => setNewDeviceName(e.target.value)}
                        autoFocus
                        disabled={isSaving}
                    />
                    <div className={styles.editNameActions}>
                      <button
                          className={styles.cancelButton}
                          onClick={() => {
                            setIsEditingName(false);
                            setNewDeviceName(deviceDetails.name);
                          }}
                          disabled={isSaving}
                      >
                        Cancel
                      </button>
                      <button
                          className={styles.submitButton}
                          onClick={handleSaveName}
                          disabled={
                              isSaving ||
                              newDeviceName.trim() === "" ||
                              newDeviceName === deviceDetails.name
                          }
                      >
                        {isSaving ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
              ) : (
                  <div className={styles.detailValueWithEdit}>
                    <div className={styles.detailValue}>{deviceDetails.name}</div>
                    <button
                        className={styles.editButton}
                        onClick={() => setIsEditingName(true)}
                        aria-label="Edit device name"
                    >
                      Edit
                    </button>
                  </div>
              )}
            </div>
            <div className={styles.detailField}>
              <label className={styles.detailLabel}>Type</label>
              <div className={styles.detailValue}>
                {deviceDetails.type === "bulb"
                    ? "Smart Bulb"
                    : "Illuminance Sensor"}
              </div>
            </div>
            <div className={styles.detailField}>
              <label className={styles.detailLabel}>Device ID</label>
              <div className={styles.detailValue}>{deviceDetails.id}</div>
            </div>
            {deviceDetails.type === "bulb" && (
                <>
                  <div className={styles.detailField}>
                    <label className={styles.detailLabel}>Power</label>
                    <div className={styles.detailValue}>{deviceDetails.power} W</div>
                  </div>
                  <div className={styles.detailField}>
                    <label className={styles.detailLabel}>
                      Luminous Efficiency
                    </label>
                    <div className={styles.detailValue}>
                      {deviceDetails.value} lm/W
                    </div>
                  </div>
                  <div className={styles.detailField}>
                    <label className={styles.detailLabel}>Brightness</label>
                    <div className={styles.detailValue}>
                      {deviceDetails.value ? deviceDetails.value : "undefined "}%
                    </div>
                  </div>
                </>
            )}
            <div className={styles.detailField}>

              {/*<div className={styles.sectionHeader}>*/}
                <label className={styles.detailLabel}>Metrics History</label>
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

              {/*</div>*/}

            </div>

            <div className={styles.metricsChart}>
              {isRefreshing && (
                  <div className={styles.refreshIndicator}>
                    <div className={styles.refreshSpinner}></div>
                  </div>
              )}
              {metricsData.length > 0 ? (
                  <div className={styles.chartData}>
                    {metricsData.map((dataPoint, index) => {
                      // For bulbs, use brightness; for sensors, use value
                      const value =
                          deviceDetails.type === "bulb"
                              ? dataPoint.value
                              : dataPoint.value;
                      const maxValue = deviceDetails.type === "bulb" ? 100 : 1000; // Max brightness is 100%, max illuminance is 1000 lux
                      const height = (value / maxValue) * 100;
                      const width = 100 / metricsData.length;
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
                              title={`${new Date(dataPoint.timestamp).toLocaleString()}: ${value} ${deviceDetails.type === "bulb" ? "%" : "lux"}`}
                          />
                      );
                    })}
                  </div>
              ) : (
                  <div className={styles.noDataMessage}>
                    No metrics data available for the selected period
                  </div>
              )}
              <div className={styles.lastUpdated}>
                Last updated: {lastDataRefresh.toLocaleTimeString()}
              </div>
            </div>

            <div className={styles.deviceActions}>
              <button
                  className={styles.deleteButton}
                  onClick={() => setShowDeleteConfirmation(true)}
              >
                Delete Device
              </button>
            </div>
          </div>
      )}
    </Modal>
  );
};

export default DeviceDetailsModal;
