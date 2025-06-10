import {
  fetchFloors,
  fetchRooms,
  fetchUnassignedDevices,
  createRoom,
  updateRoom,
  deleteRoom,
  createDevice,
  assignDeviceToRoom,
  unassignDevice,
  fetchDeviceDetails,
  fetchDeviceMetrics,
  updateRoomIlluminance,
  updateDevice,
} from "./api";
import {
  mockApiResponse,
  createMockFloor,
  createMockRoom,
  createMockDevice,
  createMockMetric,
} from "./test-utils";

// Mock global fetch
global.fetch = jest.fn();

describe("API Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("fetchFloors", () => {
    it("should fetch floors successfully", async () => {
      const mockFloors = [
        createMockFloor(1, "Ground Floor"),
        createMockFloor(2, "First Floor"),
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce(
        mockApiResponse(mockFloors),
      );

      const result = await fetchFloors();

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8000/api/floors/",
      );
      expect(result).toEqual(mockFloors);
    });

    it("should handle fetch error", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error"),
      );

      await expect(fetchFloors()).rejects.toThrow("Network error");
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8000/api/floors/",
      );
    });

    it("should handle API error response", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce(
        mockApiResponse(
          { error: "Server error" },
          500,
          "Internal Server Error",
        ),
      );

      await expect(fetchFloors()).rejects.toThrow(
        "Failed to fetch floors: 500",
      );
    });
  });

  describe("fetchRooms", () => {
    it("should fetch rooms for a floor successfully", async () => {
      const floorId = 1;
      const mockRooms = [
        createMockRoom(1, "Living Room", floorId),
        createMockRoom(2, "Kitchen", floorId),
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce(
        mockApiResponse(mockRooms),
      );

      const result = await fetchRooms(floorId);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:8000/api/rooms/?floor_id=${floorId}`,
      );
      expect(result).toEqual(mockRooms);
    });
  });

  describe("createRoom", () => {
    it("should create a room successfully", async () => {
      const roomData = {
        name: "New Room",
        floor_id: 1,
        start_time: "09:00",
        end_time: "17:00",
      };

      const mockCreatedRoom = {
        id: 3,
        ...roomData,
        devices: [],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(
        mockApiResponse(mockCreatedRoom),
      );

      const result = await createRoom(roomData);

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8000/api/rooms/",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify(roomData),
        }),
      );
      expect(result).toEqual(mockCreatedRoom);
    });
  });

  describe("updateRoom", () => {
    it("should update a room successfully", async () => {
      const roomId = 1;
      const roomData = {
        name: "Updated Room",
        start_time: "10:00",
        end_time: "18:00",
        target_illuminance: 500
      };

      const mockUpdatedRoom = {
        id: roomId,
        floor_id: 1,
        ...roomData,
        devices: [],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(
        mockApiResponse(mockUpdatedRoom),
      );

      const result = await updateRoom(roomId, roomData);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:8000/api/rooms/${roomId}`,
        expect.objectContaining({
          method: "PUT",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify(roomData),
        }),
      );
      expect(result).toEqual(mockUpdatedRoom);
    });
  });

  describe("deleteRoom", () => {
    it("should delete a room successfully", async () => {
      const roomId = 1;

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockApiResponse({}));

      await deleteRoom(roomId);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:8000/api/rooms/${roomId}`,
        expect.objectContaining({
          method: "DELETE",
        }),
      );
    });
  });

  describe("fetchUnassignedDevices", () => {
    it("should fetch unassigned devices successfully", async () => {
      const mockDevices = [
        createMockDevice(1, "Bulb 1", "bulb"),
        createMockDevice(2, "Sensor 1", "sensor"),
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce(
        mockApiResponse(mockDevices),
      );

      const result = await fetchUnassignedDevices();

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8000/api/devices/unassigned",
      );
      expect(result).toEqual(mockDevices);
    });
  });

  describe("fetchDeviceDetails", () => {
    it("should fetch device details successfully", async () => {
      const deviceId = 1;
      const mockDevice = createMockDevice(deviceId, "Test Device", "bulb");

      (global.fetch as jest.Mock).mockResolvedValueOnce(
        mockApiResponse(mockDevice),
      );

      const result = await fetchDeviceDetails(deviceId);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:8000/api/devices/${deviceId}`,
      );
      expect(result).toEqual(mockDevice);
    });
  });

  describe("createDevice", () => {
    it("should create a device successfully", async () => {
      const deviceName = "New Device";
      const deviceType = "bulb" as const;

      const mockCreatedDevice = createMockDevice(3, deviceName, deviceType);

      (global.fetch as jest.Mock).mockResolvedValueOnce(
        mockApiResponse(mockCreatedDevice),
      );

      const result = await createDevice(deviceName, deviceType);

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8000/api/devices/",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({
            name: deviceName,
            type: deviceType,
          }),
        }),
      );
      expect(result).toEqual(mockCreatedDevice);
    });
  });

  describe("assignDeviceToRoom", () => {
    it("should assign a device to a room successfully", async () => {
      const deviceId = 1;
      const roomId = 2;

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockApiResponse({}));

      await assignDeviceToRoom(deviceId, roomId);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:8000/api/devices/${deviceId}/assign?room_id=${roomId}`,
        expect.objectContaining({
          method: "PUT",
        }),
      );
    });
  });

  describe("unassignDevice", () => {
    it("should unassign a device successfully", async () => {
      const deviceId = 1;

      (global.fetch as jest.Mock).mockResolvedValueOnce(mockApiResponse({}));

      await unassignDevice(deviceId);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:8000/api/devices/${deviceId}/unassign`,
        expect.objectContaining({
          method: "PUT",
        }),
      );
    });
  });

  describe("fetchDeviceMetrics", () => {
    it("should fetch device metrics successfully", async () => {
      const deviceId = 1;
      const startTime = "2023-01-01T00:00:00Z";
      const endTime = "2023-01-02T00:00:00Z";

      const mockMetrics = [
        createMockMetric("2023-01-01T06:00:00Z", 500),
        createMockMetric("2023-01-01T12:00:00Z", 700),
        createMockMetric("2023-01-01T18:00:00Z", 300),
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce(
        mockApiResponse(mockMetrics),
      );

      const result = await fetchDeviceMetrics(deviceId, startTime, endTime);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:8000/api/devices/${deviceId}/metrics?start_time=${startTime}&end_time=${endTime}`,
      );
      expect(result).toEqual(mockMetrics);
    });
  });

  describe("updateRoomIlluminance", () => {
    it("should update room illuminance successfully", async () => {
      const roomId = 1;
      const targetIlluminance = 600;

      const mockUpdatedRoom = createMockRoom(roomId, "Living Room", 1);
      mockUpdatedRoom.targetIlluminance = targetIlluminance;

      (global.fetch as jest.Mock).mockResolvedValueOnce(
        mockApiResponse(mockUpdatedRoom),
      );

      const result = await updateRoomIlluminance(roomId, targetIlluminance);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:8000/api/rooms/${roomId}/illuminance`,
        expect.objectContaining({
          method: "PUT",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({ targetIlluminance }),
        }),
      );
      expect(result).toEqual(mockUpdatedRoom);
    });
  });

  describe("updateDevice", () => {
    it("should update a device successfully", async () => {
      const deviceId = 1;
      const deviceData = {
        name: "Updated Device",
      };

      const mockUpdatedDevice = {
        ...createMockDevice(deviceId, "Updated Device", "bulb"),
        ...deviceData,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce(
        mockApiResponse(mockUpdatedDevice),
      );

      const result = await updateDevice(deviceId, deviceData);

      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:8000/api/devices/${deviceId}`,
        expect.objectContaining({
          method: "PUT",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify(deviceData),
        }),
      );
      expect(result).toEqual(mockUpdatedDevice);
    });
  });
});
