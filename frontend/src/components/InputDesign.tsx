"use client";
import React, { useState, useEffect } from "react";
import styles from "./InputDesign.module.css";

// Import types
import { Device, Floor, Room, DeviceType } from "./types";

// Import components
import FloorSelector from "./FloorSelector";
import RoomCard from "./RoomCard";
import UnassignedDevices from "./UnassignedDevices";
import NewRoomModal from "./NewRoomModal";
import EditRoomModal from "./EditRoomModal";
import DeleteRoomModal from "./DeleteRoomModal";
import DeviceDetailsModal from "./DeviceDetailsModal";
import NewDeviceModal from "./NewDeviceModal";
import { NotificationProvider, useNotification } from "./NotificationContext";

// Import API functions
import {
  fetchFloors,
  fetchRooms,
  fetchUnassignedDevices,
  createRoom,
  updateRoom,
  deleteRoom,
  createDevice,
  assignDeviceToRoom,
  unassignDevice, updateDevice,
} from "./api";

// Main component content
function InputDesignContent() {
  // State for data
  const [floors, setFloors] = useState<Floor[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [unassignedDevices, setUnassignedDevices] = useState<Device[]>([]);

  // State for selections
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  // State for modals
  const [showNewRoomModal, setShowNewRoomModal] = useState<boolean>(false);
  const [showEditRoomModal, setShowEditRoomModal] = useState<boolean>(false);
  const [showDeleteRoomModal, setShowDeleteRoomModal] =
    useState<boolean>(false);
  const [showDeviceModal, setShowDeviceModal] = useState<boolean>(false);
  const [showNewDeviceModal, setShowNewDeviceModal] = useState<boolean>(false);

  // State for data updates
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateInterval, setUpdateInterval] = useState<number>(30000); // 30 seconds by default

  // API functions handlers
  const { addNotification } = useNotification();

  const handleFetchFloors = async () => {
    try {
      const data = await fetchFloors();
      setFloors(data);
      if (data.length > 0 && !selectedFloor) {
        setSelectedFloor(data[0].id);
        handleFetchRooms(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching floors:", error);
      addNotification(
        "error",
        `Failed to fetch floors: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const handleFetchRooms = async (floorId: number) => {
    try {
      const data = await fetchRooms(floorId);
      setRooms(data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      addNotification(
        "error",
        `Failed to fetch rooms: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const handleFetchUnassignedDevices = async () => {
    try {
      const data = await fetchUnassignedDevices();
      setUnassignedDevices(data);
    } catch (error) {
      console.error("Error fetching unassigned devices:", error);
      addNotification(
        "error",
        `Failed to fetch unassigned devices: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const handleCreateRoom = async (
    name: string,
    startTime: string,
    endTime: string,
  ) => {
    if (!selectedFloor) return;

    try {
      await createRoom({
        name,
        floor_id: selectedFloor,
        start_time: startTime,
        end_time: endTime,
      });
      handleFetchRooms(selectedFloor);
      addNotification("success", `Room "${name}" created successfully`);
    } catch (error) {
      console.error("Error creating room:", error);
      addNotification(
        "error",
        `Failed to create room: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const handleUpdateRoom = async (
    roomId: number,
    name: string,
    startTime: string,
    endTime: string,
  ) => {
    try {
      await updateRoom(roomId, {
        name,
        start_time: startTime,
        end_time: endTime,
      });
      if (selectedFloor) {
        handleFetchRooms(selectedFloor);
      }
      addNotification("success", `Room "${name}" updated successfully`);
    } catch (error) {
      console.error("Error updating room:", error);
      addNotification(
        "error",
        `Failed to update room: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const handleDeleteRoom = async (roomId: number) => {
    try {
      await deleteRoom(roomId);
      if (selectedFloor) {
        handleFetchRooms(selectedFloor);
      }
      addNotification("success", "Room deleted successfully");
    } catch (error) {
      console.error("Error deleting room:", error);
      addNotification(
        "error",
        `Failed to delete room: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const handleCreateDevice = async (name: string, type: DeviceType) => {
    try {
      await createDevice(name, type);
      handleFetchUnassignedDevices();
      addNotification("success", `Device "${name}" created successfully`);
    } catch (error) {
      console.error("Error creating device:", error);
      addNotification(
        "error",
        `Failed to create device: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const handleDeleteDevice = async (deviceId: number) => {
    try {
      // Update local state immediately for better UX
      // Remove from rooms
      setRooms(
        rooms.map((room) => ({
          ...room,
          devices: room.devices.filter((device) => device.id !== deviceId),
        })),
      );

      // Remove from unassigned devices
      setUnassignedDevices(
        unassignedDevices.filter((device) => device.id !== deviceId),
      );

      // Refresh data from server to ensure consistency
      if (selectedFloor) {
        await Promise.all([
          handleFetchRooms(selectedFloor),
          handleFetchUnassignedDevices(),
        ]);
      }
    } catch (error) {
      console.error("Error handling device deletion:", error);
      addNotification(
        "error",
        `Error updating UI after device deletion: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const handleAssignDevice = async (
    deviceId: number,
    roomId: number | null,
  ) => {
    try {
      // Get the device being moved
      const deviceToMove =
        roomId === null
          ? rooms.reduce<Device | null>((found, room) => {
              const device = room.devices.find((d) => d.id === deviceId);
              return device || found;
            }, null)
          : unassignedDevices.find((d) => d.id === deviceId) ||
            rooms.reduce<Device | null>((found, room) => {
              const device = room.devices.find((d) => d.id === deviceId);
              return device || found;
            }, null);

      // Check if the device is a sensor and if the target room already has a sensor
      if (deviceToMove?.type === "sensor" && roomId !== null) {
        const targetRoom = rooms.find((room) => room.id === roomId);
        if (
          targetRoom &&
          targetRoom.devices.some((device) => device.type === "sensor")
        ) {
          throw new Error(
            "Room already has a sensor. Only one sensor allowed per room.",
          );
        }
      }

      if (roomId === null) {
        // Make API call to unassign device
        await unassignDevice(deviceId);
      } else {
        // Make API call to assign device
        await assignDeviceToRoom(deviceId, roomId);
      }

      // Update local state immediately for smooth UI
      if (roomId === null) {
        // Moving to unassigned
        const deviceToMove = rooms.reduce<Device | null>((found, room) => {
          const device = room.devices.find((d) => d.id === deviceId);
          return device || found;
        }, null);

        if (deviceToMove) {
          setRooms(
            rooms.map((room) => ({
              ...room,
              devices: room.devices.filter((d) => d.id !== deviceId),
            })),
          );
          setUnassignedDevices([...unassignedDevices, deviceToMove]);
        }
      } else {
        // Moving to a room
        const sourceRoom = rooms.find((room) =>
          room.devices.some((d) => d.id === deviceId),
        );

        let deviceToMove: Device | undefined;
        if (sourceRoom) {
          // Moving between rooms
          deviceToMove = sourceRoom.devices.find((d) => d.id === deviceId);

          if (deviceToMove) {
            setRooms(
              rooms.map((room) => {
                if (room.id === sourceRoom.id) {
                  return {
                    ...room,
                    devices: room.devices.filter((d) => d.id !== deviceId),
                  };
                }
                if (room.id === roomId) {
                  return {
                    ...room,
                    devices: [...room.devices, deviceToMove!],
                  };
                }
                return room;
              }),
            );
          }
        } else {
          // Moving from unassigned
          deviceToMove = unassignedDevices.find((d) => d.id === deviceId);

          if (deviceToMove) {
            setUnassignedDevices(
              unassignedDevices.filter((d) => d.id !== deviceId),
            );

            setRooms(
              rooms.map((room) => {
                if (room.id === roomId) {
                  return {
                    ...room,
                    devices: [...room.devices, deviceToMove!],
                  };
                }
                return room;
              }),
            );
          }
        }
      }

      // Refresh data from server to ensure consistency
      if (selectedFloor) {
        await Promise.all([
          handleFetchRooms(selectedFloor),
          handleFetchUnassignedDevices(),
        ]);
      }

      return { success: true };
    } catch (error) {
      console.error("Error assigning device:", error);
      // Revert local state changes on error
      if (selectedFloor) {
        await Promise.all([
          handleFetchRooms(selectedFloor),
          handleFetchUnassignedDevices(),
        ]);
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  // Toggle device on/off
  const handleToggleDevice = async (device: Device) => {
    setRooms(
      rooms.map((room) => ({
        ...room,
        devices: room.devices.map((d) =>
          d.id === device.id
            ? {
                ...d,
                is_on: !d.is_on,
              }
            : d,
        ),
      })),
    );
    // TODO make API call to update bulb
    await updateDevice(device.id, {is_on: !device.is_on})
  };

  // Handle device drop
  const handleDeviceDrop = async (
    e: React.DragEvent<HTMLElement>,
    roomId: number | null = null,
  ) => {
    e.preventDefault();

    // Store a reference to the drop target element
    const dropTargetElement = e.currentTarget;

    const deviceId = Number(e.dataTransfer.getData("deviceId"));
    const sourceRoomId = e.dataTransfer.getData("sourceRoomId");

    console.log(`aaaa2.${styles.deviceItem}, .${styles.unassignedDevvice}`)
    // Reset any dragged element styles
    const draggedElements = document.querySelectorAll(
      `.${styles.deviceItem}, .${styles.unassignedDevvice}`,
    );
    draggedElements.forEach((el) => {
      if (el) {
        (el as HTMLElement).style.opacity = "";
        (el as HTMLElement).style.transform = "";
        (el as HTMLElement).style.cursor = "";
      }
    });

    // Apply visual feedback function with safety checks
    const applyVisualFeedback = (element: HTMLElement, isSuccess: boolean) => {
      if (!element) return;

      try {
        if (isSuccess) {
          element.style.backgroundColor = "rgba(34, 197, 94, 0.1)";
          element.style.borderColor = "#22c55e";
        } else {
          element.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
          element.style.borderColor = "#ef4444";
        }

        setTimeout(() => {
          if (element) {
            element.style.backgroundColor = "";
            element.style.borderColor = "";
          }
        }, 500);
      } catch (err) {
        console.error("Error applying visual feedback:", err);
      }
    };

    // Only reassign if source and target are different
    if (sourceRoomId !== (roomId?.toString() || null)) {
      try {
        // Get the device type to check if it's a sensor
        const deviceType =
          unassignedDevices.find((d) => d.id === deviceId)?.type ||
          rooms.reduce<DeviceType | null>((type, room) => {
            const device = room.devices.find((d) => d.id === deviceId);
            return device ? device.type : type;
          }, null);

        // Check if it's a sensor and if the room already has one
        if (deviceType === "sensor" && roomId !== null) {
          const targetRoom = rooms.find((room) => room.id === roomId);
          if (
            targetRoom &&
            targetRoom.devices.some((device) => device.type === "sensor")
          ) {
            throw new Error(
              "Room already has a sensor. Only one sensor allowed per room.",
            );
          }
        }

        const result = await handleAssignDevice(deviceId, roomId);

        if (result.success) {
          // Visual feedback on successful drop
          applyVisualFeedback(dropTargetElement, true);
          addNotification(
            "success",
            roomId === null
              ? "Device moved to unassigned devices"
              : `Device assigned to ${rooms.find((r) => r.id === roomId)?.name || "room"}`,
          );
        } else {
          throw new Error(result.error || "Failed to assign device");
        }
      } catch (error) {
        // Visual feedback on failed drop
        applyVisualFeedback(dropTargetElement, false);

        // Show error notification
        addNotification(
          "error",
          error instanceof Error
            ? error.message
            : "Error assigning device. Please try again.",
        );
      }
    } else {
      // Reset the drop target styling even if no assignment happened
      if (dropTargetElement) {
        dropTargetElement.style.backgroundColor = "";
        dropTargetElement.style.borderColor = "";
      }
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    handleFetchFloors();
    handleFetchUnassignedDevices();
  }, []);

  // Update rooms when selected floor changes
  useEffect(() => {
    if (selectedFloor) {
      handleFetchRooms(selectedFloor);
    }
  }, [selectedFloor]);

  // Set up polling for data updates
  useEffect(() => {
    // Function to update all data
    const updateAllData = async () => {
      if (isUpdating) return; // Prevent multiple simultaneous updates

      try {
        setIsUpdating(true);

        // Update timestamp
        setLastUpdateTime(new Date());

        // Fetch all necessary data
        if (selectedFloor) {
          await handleFetchRooms(selectedFloor);
        }
        await handleFetchUnassignedDevices();

        console.log(`Data updated at ${new Date().toLocaleTimeString()}`);
      } catch (error) {
        console.error("Error updating data:", error);
      } finally {
        setIsUpdating(false);
      }
    };

    // Set up interval for regular updates
    const intervalId = setInterval(updateAllData, updateInterval);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [selectedFloor, updateInterval, isUpdating]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Smart Home Manager</h1>
        <div className={styles.controls}>
          <FloorSelector
              floors={floors}
              selectedFloor={selectedFloor}
              onFloorChange={(floorId) => {
                setSelectedFloor(floorId);
                handleFetchRooms(floorId);
              }}
          />
          <button
              className={styles.addRoomButton}
              onClick={() => setShowNewRoomModal(true)}
          >
            Add Room
          </button>
          {/*<div className={styles.updateInfo}>*/}
            <span>Auto-updating every </span>
            <select
                className={styles.updateIntervalSelect}
                value={updateInterval}
                onChange={(e) => setUpdateInterval(parseInt(e.target.value))}
            >
              <option value="10000">10 seconds</option>
              <option value="30000">30 seconds</option>
              <option value="60000">1 minute</option>
              <option value="300000">5 minutes</option>
            </select>
            <span className={styles.lastUpdatedMngmt}>
            Last updated: {lastUpdateTime.toLocaleTimeString()}
          </span>
            <button
                className={styles.refreshButton}
                onClick={() => {
                  if (selectedFloor) {
                    handleFetchRooms(selectedFloor);
                  }
                  handleFetchUnassignedDevices();
                  setLastUpdateTime(new Date());
                }}
                disabled={isUpdating}
            >
              {isUpdating ? "Updating..." : "Refresh Now"}
            </button>
          {/*</div>*/}
        </div>

      </header>

      <main className={styles.main}>
        {rooms.length === 0 ? (
            <div className={styles.emptyState}>
            <p>
              No rooms assosiated with floor, please create some
            </p>
          </div>
        ) : (rooms.map((room) => (
            <RoomCard
                key={room.id}
                room={room}
                onEditRoom={(room) => {
                  setSelectedRoom(room);
                  setShowEditRoomModal(true);
                }}
                onDeleteRoom={(room) => {
                  setSelectedRoom(room);
                  setShowDeleteRoomModal(true);
                }}
                onDeviceClick={(device) => {
                  setSelectedDevice(device);
                  setShowDeviceModal(true);
                }}
                onToggleDevice={handleToggleDevice}
                onDropDevice={handleDeviceDrop}
            />
        )))}
      </main>

      <UnassignedDevices
          devices={unassignedDevices}
          onRefresh={handleFetchUnassignedDevices}
          onAddDevice={() => setShowNewDeviceModal(true)}
          onDeviceDrop={(e) => handleDeviceDrop(e, null)}
          onDeviceClick={(device) => {
            setSelectedDevice(device);
            setShowDeviceModal(true);
          }}
          onToggleDevice={handleToggleDevice}
        onDeviceDrag={(e, deviceId) => {
          e.dataTransfer.setData("deviceId", deviceId.toString());
          e.dataTransfer.setData("sourceRoomId", "");
        }}
      />

      {/* Modals */}
      {showNewRoomModal && (
        <NewRoomModal
          onClose={() => setShowNewRoomModal(false)}
          onCreateRoom={handleCreateRoom}
        />
      )}

      {showEditRoomModal && selectedRoom && (
        <EditRoomModal
          room={selectedRoom}
          onClose={() => setShowEditRoomModal(false)}
          onUpdateRoom={handleUpdateRoom}
        />
      )}

      {showDeleteRoomModal && selectedRoom && (
        <DeleteRoomModal
          room={selectedRoom}
          onClose={() => setShowDeleteRoomModal(false)}
          onDeleteRoom={handleDeleteRoom}
        />
      )}

      {showDeviceModal && selectedDevice && (
        <DeviceDetailsModal
          device={selectedDevice}
          onClose={() => setShowDeviceModal(false)}
          onDelete={handleDeleteDevice}
        />
      )}

      {showNewDeviceModal && (
        <NewDeviceModal
          onClose={() => setShowNewDeviceModal(false)}
          onCreateDevice={handleCreateDevice}
        />
      )}
    </div>
  );
}

// Wrapper component with NotificationProvider
const InputDesign: React.FC = () => {
  return (
    <NotificationProvider>
      <InputDesignContent />
    </NotificationProvider>
  );
};

export default InputDesign;
