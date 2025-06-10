import React from "react";
import { render, screen, fireEvent } from "./test-utils";
import FloorSelector from "./FloorSelector";
import { createMockFloor } from "./test-utils";

describe("FloorSelector Component", () => {
  const mockFloors = [
    createMockFloor(1, "Ground Floor"),
    createMockFloor(2, "First Floor"),
    createMockFloor(3, "Second Floor"),
  ];

  const mockOnFloorChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with floors", () => {
    render(
      <FloorSelector
        floors={mockFloors}
        selectedFloor={1}
        onFloorChange={mockOnFloorChange}
      />,
    );

    const selector = screen.getByLabelText("Select floor");
    expect(selector).toBeInTheDocument();

    // Check if all floor options are rendered
    mockFloors.forEach((floor) => {
      expect(screen.getByText(floor.name)).toBeInTheDocument();
    });
  });

  it("selects the correct floor", () => {
    render(
      <FloorSelector
        floors={mockFloors}
        selectedFloor={2}
        onFloorChange={mockOnFloorChange}
      />,
    );

    const selector = screen.getByLabelText("Select floor") as HTMLSelectElement;
    expect(selector.value).toBe("2");
  });

  it("shows placeholder when no floor is selected", () => {
    render(
      <FloorSelector
        floors={mockFloors}
        selectedFloor={null}
        onFloorChange={mockOnFloorChange}
      />,
    );

    const selector = screen.getByLabelText("Select floor") as HTMLSelectElement;
    expect(selector.value).toBe("");
    expect(screen.getByText("Select a floor")).toBeInTheDocument();
  });

  it("calls onFloorChange when selection changes", () => {
    render(
      <FloorSelector
        floors={mockFloors}
        selectedFloor={1}
        onFloorChange={mockOnFloorChange}
      />,
    );

    const selector = screen.getByLabelText("Select floor");
    fireEvent.change(selector, { target: { value: "3" } });

    expect(mockOnFloorChange).toHaveBeenCalledWith(3);
  });

  it("handles empty floors array", () => {
    render(
      <FloorSelector
        floors={[]}
        selectedFloor={null}
        onFloorChange={mockOnFloorChange}
      />,
    );

    const selector = screen.getByLabelText("Select floor");
    expect(selector).toBeInTheDocument();
    expect(selector.children.length).toBe(1); // Just the placeholder
  });
});
