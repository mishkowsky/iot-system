import React from "react";
import { render, screen, fireEvent } from "./test-utils";
import DeviceItem from "./DeviceItem";
import { createMockDevice } from "./test-utils";

describe("DeviceItem Component", () => {
  const mockBulb = createMockDevice(1, "Test Bulb", "bulb");
  mockBulb.is_on = true;
  mockBulb.brightness = 75;

  const mockSensor = createMockDevice(2, "Test Sensor", "sensor");
  mockSensor.value = 650;

  const mockOnDeviceClick = jest.fn();
  const mockOnToggleDevice = jest.fn();
  const mockOnDragStart = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders a bulb device correctly", () => {
    render(
      <DeviceItem
        device={mockBulb}
        onDeviceClick={mockOnDeviceClick}
        onToggleDevice={mockOnToggleDevice}
        onDragStart={mockOnDragStart}
      />,
    );

    expect(screen.getByText("Test Bulb")).toBeInTheDocument();
    expect(screen.getByText("Brightness: 75%")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /toggle test bulb off/i }),
    ).toBeInTheDocument();
  });

  it("renders a sensor device correctly", () => {
    render(
      <DeviceItem
        device={mockSensor}
        onDeviceClick={mockOnDeviceClick}
        onToggleDevice={mockOnToggleDevice}
        onDragStart={mockOnDragStart}
      />,
    );

    expect(screen.getByText("Test Sensor")).toBeInTheDocument();
    expect(screen.getByText("650 lux")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /toggle/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("📊")).toBeInTheDocument();
  });

  it("calls onDeviceClick when device name is clicked", () => {
    render(
      <DeviceItem
        device={mockBulb}
        onDeviceClick={mockOnDeviceClick}
        onToggleDevice={mockOnToggleDevice}
        onDragStart={mockOnDragStart}
      />,
    );

    fireEvent.click(screen.getByText("Test Bulb"));
    expect(mockOnDeviceClick).toHaveBeenCalledWith(mockBulb);
  });

  it("calls onToggleDevice when toggle button is clicked", () => {
    render(
      <DeviceItem
        device={mockBulb}
        onDeviceClick={mockOnDeviceClick}
        onToggleDevice={mockOnToggleDevice}
        onDragStart={mockOnDragStart}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /toggle test bulb off/i }),
    );
    expect(mockOnToggleDevice).toHaveBeenCalledWith(mockBulb);
  });

  it("calls onDragStart when dragging starts", () => {
    render(
      <DeviceItem
        device={mockBulb}
        onDeviceClick={mockOnDeviceClick}
        onToggleDevice={mockOnToggleDevice}
        onDragStart={mockOnDragStart}
        draggable={true}
      />,
    );

    const deviceItem = screen.getByText("Test Bulb").closest("div");
    expect(deviceItem).toBeInTheDocument();

    if (deviceItem) {
      fireEvent.dragStart(deviceItem);
      expect(mockOnDragStart).toHaveBeenCalled();
    }
  });

  it("is not draggable when draggable prop is false", () => {
    render(
      <DeviceItem
        device={mockBulb}
        onDeviceClick={mockOnDeviceClick}
        onToggleDevice={mockOnToggleDevice}
        onDragStart={mockOnDragStart}
        draggable={false}
      />,
    );

    const deviceItem = screen.getByText("Test Bulb").closest("div");
    expect(deviceItem).toHaveAttribute("draggable", "false");
  });

  it("shows correct bulb state when off", () => {
    const offBulb = { ...mockBulb, is_on: false };

    render(
      <DeviceItem
        device={offBulb}
        onDeviceClick={mockOnDeviceClick}
        onToggleDevice={mockOnToggleDevice}
        onDragStart={mockOnDragStart}
      />,
    );

    const toggleButton = screen.getByRole("button", {
      name: /toggle test bulb on/i,
    });
    expect(toggleButton).toHaveStyle({ backgroundColor: "white" });
  });

  it("shows correct bulb state when on", () => {
    render(
      <DeviceItem
        device={mockBulb}
        onDeviceClick={mockOnDeviceClick}
        onToggleDevice={mockOnToggleDevice}
        onDragStart={mockOnDragStart}
      />,
    );

    const toggleButton = screen.getByRole("button", {
      name: /toggle test bulb off/i,
    });
    expect(toggleButton).toHaveStyle({ backgroundColor: "rgb(254, 240, 138)" });
  });
});
