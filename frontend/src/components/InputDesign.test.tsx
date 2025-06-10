import React from "react";
import { render, screen, fireEvent, waitFor } from "./test-utils";
import "@testing-library/jest-dom";
import InputDesign from "./InputDesign";
import {
  createMockFloor,
  createMockRoom,
  createMockDevice,
} from "./test-utils";

// Mock fetch
global.fetch = jest.fn();

// Helper to setup fetch mock responses
const mockFetch = (data: any) => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => data,
  });
};

describe("InputDesign Component", () => {
  const mockFloors = [
    createMockFloor(1, "Ground Floor"),
    createMockFloor(2, "First Floor"),
  ];

  const mockRooms = [
    createMockRoom(1, "Living Room", 1, [
      createMockDevice(1, "Living Room Light", "bulb", 1),
      createMockDevice(2, "Living Room Sensor", "sensor", 1),
    ]),
    createMockRoom(2, "Kitchen", 1, [
      createMockDevice(3, "Kitchen Light", "bulb", 2),
    ]),
  ];

  const mockUnassignedDevices = [
    createMockDevice(4, "Unassigned Bulb", "bulb"),
    createMockDevice(5, "Unassigned Sensor", "sensor"),
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock initial API calls
    mockFetch(mockFloors); // floors
    mockFetch(mockRooms); // rooms
    mockFetch(mockUnassignedDevices); // unassigned devices
  });

  test("renders the Smart Home Manager title", async () => {
    render(<InputDesign />);

    await waitFor(() => {
      expect(screen.getByText("Smart Home Manager")).toBeInTheDocument();
    });
  });

  test("displays floor selector and Add Room button", async () => {
    render(<InputDesign />);

    await waitFor(() => {
      expect(screen.getByLabelText("Select floor")).toBeInTheDocument();
      expect(screen.getByText("Add Room")).toBeInTheDocument();
    });
  });

  test("opens new room modal when Add Room button is clicked", async () => {
    render(<InputDesign />);

    await waitFor(() => {
      expect(screen.getByText("Add Room")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Add Room"));

    expect(screen.getByText("Add New Room")).toBeInTheDocument();
    expect(screen.getByLabelText("Room Name")).toBeInTheDocument();
  });

  test("displays rooms when data is loaded", async () => {
    render(<InputDesign />);

    await waitFor(() => {
      expect(screen.getByText("Living Room")).toBeInTheDocument();
      expect(screen.getByText("Kitchen")).toBeInTheDocument();
    });
  });

  test("displays unassigned devices section", async () => {
    render(<InputDesign />);

    await waitFor(() => {
      expect(screen.getByText("Unassigned Devices")).toBeInTheDocument();
      expect(screen.getByText("Add Device")).toBeInTheDocument();
    });
  });

  test("opens new device modal when Add Device button is clicked", async () => {
    render(<InputDesign />);

    await waitFor(() => {
      expect(screen.getByText("Add Device")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Add Device"));

    expect(screen.getByText("Add New Device")).toBeInTheDocument();
    expect(screen.getByLabelText("Device Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Device Type")).toBeInTheDocument();
  });

  test("shows edit and delete buttons for rooms", async () => {
    render(<InputDesign />);

    await waitFor(() => {
      expect(screen.getByText("Living Room")).toBeInTheDocument();
    });

    // There might be multiple Edit/Delete buttons (one per room)
    expect(screen.getAllByText("Edit")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Delete")[0]).toBeInTheDocument();
  });

  test("opens edit room modal when Edit button is clicked", async () => {
    render(<InputDesign />);

    await waitFor(() => {
      expect(screen.getByText("Living Room")).toBeInTheDocument();
    });

    // Click the first Edit button (for Living Room)
    fireEvent.click(screen.getAllByText("Edit")[0]);

    expect(screen.getByText("Edit Room")).toBeInTheDocument();
  });

  test("opens delete room modal when Delete button is clicked", async () => {
    render(<InputDesign />);

    await waitFor(() => {
      expect(screen.getByText("Living Room")).toBeInTheDocument();
    });

    // Click the first Delete button (for Living Room)
    fireEvent.click(screen.getAllByText("Delete")[0]);

    expect(
      screen.getByText(/Are you sure you want to delete this room/),
    ).toBeInTheDocument();
  });

  test("displays devices in room cards", async () => {
    render(<InputDesign />);

    await waitFor(() => {
      expect(screen.getByText("Living Room Light")).toBeInTheDocument();
      expect(screen.getByText("Living Room Sensor")).toBeInTheDocument();
      expect(screen.getByText("Kitchen Light")).toBeInTheDocument();
    });
  });

  test("displays unassigned devices", async () => {
    render(<InputDesign />);

    await waitFor(() => {
      expect(screen.getByText("Unassigned Bulb")).toBeInTheDocument();
      expect(screen.getByText("Unassigned Sensor")).toBeInTheDocument();
    });
  });

  test("opens device details modal when clicking on a device", async () => {
    render(<InputDesign />);

    await waitFor(() => {
      expect(screen.getByText("Living Room Light")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Living Room Light"));

    expect(screen.getByText("Device Details")).toBeInTheDocument();
    expect(screen.getByText("Living Room Light")).toBeInTheDocument();
    expect(screen.getByText("Smart Bulb")).toBeInTheDocument();
  });

  test("can change update interval", async () => {
    render(<InputDesign />);

    await waitFor(() => {
      expect(screen.getByText("Auto-updating every")).toBeInTheDocument();
    });

    const select = screen.getByRole("combobox", { name: "" });
    fireEvent.change(select, { target: { value: "60000" } });

    expect(select).toHaveValue("60000");
  });

  test("can refresh data manually", async () => {
    // Set up additional mocks for the refresh action
    mockFetch(mockFloors);
    mockFetch(mockRooms);
    mockFetch(mockUnassignedDevices);

    render(<InputDesign />);

    await waitFor(() => {
      expect(screen.getByText("Refresh Now")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Refresh Now"));

    // Verify that fetch was called again
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(6); // 3 initial + 3 refresh
    });
  });

  test("creates a new room", async () => {
    // Mock the API response for room creation
    mockFetch({
      id: 3,
      name: "New Room",
      floor_id: 1,
      start_time: "10:00",
      end_time: "18:00",
      devices: [],
    });
    mockRooms.concat([
        {
          id: 3,
          name: "New Room",
          floor_id: 1,
          start_time: "10:00",
          end_time: "18:00",
          devices: [],
          targetIlluminance: 10,
        }
      ])
    mockFetch(mockRooms);

    render(<InputDesign />);

    await waitFor(() => {
      expect(screen.getByText("Add Room")).toBeInTheDocument();
    });

    // Open the modal
    fireEvent.click(screen.getByText("Add Room"));

    // Fill the form
    fireEvent.change(screen.getByLabelText("Room Name"), {
      target: { value: "New Room" },
    });
    fireEvent.change(screen.getAllByLabelText(/time/i)[0], {
      target: { value: "10:00" },
    });
    fireEvent.change(screen.getAllByLabelText(/time/i)[1], {
      target: { value: "18:00" },
    });

    // Submit the form
    fireEvent.click(screen.getByText("Create Room"));

    // Verify API call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8000/api/rooms/",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("New Room"),
        }),
      );
    });
  });

  test("creates a new device", async () => {
    // Mock the API response for device creation
    mockFetch({
      id: 6,
      name: "New Device",
      type: "bulb",
      is_on: false,
      brightness: 0,
    });
    mockFetch([
      ...mockUnassignedDevices,
      { id: 6, name: "New Device", type: "bulb", is_on: false, brightness: 0 },
    ]);

    render(<InputDesign />);

    await waitFor(() => {
      expect(screen.getByText("Add Device")).toBeInTheDocument();
    });

    // Open the modal
    fireEvent.click(screen.getByText("Add Device"));

    // Fill the form
    fireEvent.change(screen.getByLabelText("Device Name"), {
      target: { value: "New Device" },
    });
    fireEvent.change(screen.getByLabelText("Device Type"), {
      target: { value: "bulb" },
    });

    // Submit the form
    fireEvent.click(screen.getByText("Create Device"));

    // Verify API call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8000/api/devices/",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("New Device"),
        }),
      );
    });
  });
});
