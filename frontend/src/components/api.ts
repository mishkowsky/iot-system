import {
  Device,
  DeviceType,
  Floor,
  Room,
  RoomCreate,
  RoomUpdate,
  DeviceMetric,
} from "./types";

const API_BASE_URL = "http://192.168.10.115";

// Floor API functions
export async function fetchFloors(): Promise<Floor[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/floors/`);
    if (!response.ok) {
      throw new Error(`Failed to fetch floors: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching floors:", error);
    throw error;
  }
}

// Room API functions
export async function fetchRooms(floorId: number): Promise<Room[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/rooms/?floor_id=${floorId}`,
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch rooms: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching rooms:", error);
    throw error;
  }
}

export async function createRoom(roomData: RoomCreate): Promise<Room> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/rooms/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(roomData),
    });
    if (!response.ok) {
      throw new Error(`Failed to create room: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error creating room:", error);
    throw error;
  }
}

export async function updateRoom(
  roomId: number,
  roomData: RoomUpdate,
): Promise<Room> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(roomData),
    });
    if (!response.ok) {
      throw new Error(`Failed to update room: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error updating room:", error);
    throw error;
  }
}

export async function deleteRoom(roomId: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Failed to delete room: ${response.status}`);
    }
  } catch (error) {
    console.error("Error deleting room:", error);
    throw error;
  }
}

// Device API functions

export async function fetchDevices(roomId: number): Promise<Device[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/devices/?room_id=${roomId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch devices: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching devices:", error);
    throw error;
  }
}

export async function fetchUnassignedDevices(): Promise<Device[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/devices/unassigned`);
    if (!response.ok) {
      throw new Error(`Failed to fetch unassigned devices: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching unassigned devices:", error);
    throw error;
  }
}

export async function fetchDeviceDetails(deviceId: number): Promise<Device> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/devices/${deviceId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch device details: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching device details:", error);
    throw error;
  }
}

export async function updateDevice(
  deviceId: number,
  deviceData: Partial<Device>
): Promise<Device> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/devices/${deviceId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(deviceData),
    });
    if (!response.ok) {
      throw new Error(`Failed to update device: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error updating device:", error);
    throw error;
  }
}

export async function deleteDevice(deviceId: number): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/devices/${deviceId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Failed to delete device: ${response.status}`);
    }
  } catch (error) {
    console.error("Error deleting device:", error);
    throw error;
  }
}

// export async function updateDevice(
//   deviceId: number,
//   deviceData: Partial<Device>,
// ): Promise<Device> {
//   try {
//     const response = await fetch(`${API_BASE_URL}/api/devices/${deviceId}`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(deviceData),
//     });
//     if (!response.ok) {
//       throw new Error(`Failed to update device: ${response.status}`);
//     }
//     return await response.json();
//   } catch (error) {
//     console.error("Error updating device:", error);
//     throw error;
//   }
// }

export async function assignDeviceToRoom(
  deviceId: number,
  roomId: number,
): Promise<void> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/devices/${deviceId}/assign?room_id=${roomId}`,
      {
        method: "PUT",
      },
    );
    if (!response.ok) {
      throw new Error(`Failed to assign device: ${response.status}`);
    }
  } catch (error) {
    console.error("Error assigning device:", error);
    throw error;
  }
}

export async function unassignDevice(deviceId: number): Promise<void> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/devices/${deviceId}/unassign`,
      {
        method: "PUT",
      },
    );
    if (!response.ok) {
      throw new Error(`Failed to unassign device: ${response.status}`);
    }
  } catch (error) {
    console.error("Error unassigning device:", error);
    throw error;
  }
}

export async function fetchDeviceMetrics(
  deviceId: number,
  startTime: string,
  endTime: string,
): Promise<DeviceMetric[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/metrics/?device_id=${deviceId}&start_time=${startTime}&end_time=${endTime}`,
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch device metrics: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching device metrics:", error);
    throw error;
  }
}

export async function updateRoomIlluminance(
  roomId: number,
  targetIlluminance: number,
): Promise<Room> {
  try {
    const target_illuminance = targetIlluminance;
    const response = await fetch(
      `${API_BASE_URL}/api/rooms/${roomId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ target_illuminance }),
      },
    );
    if (!response.ok) {
      throw new Error(`Failed to update room illuminance: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error updating room illuminance:", error);
    throw error;
  }
}

export async function createDevice(
  name: string,
  type: DeviceType,
): Promise<Device> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/devices/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        type,
      }),
    });
    if (!response.ok) {
      throw new Error(`Failed to create device: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error creating device:", error);
    throw error;
  }
}