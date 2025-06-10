import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import Notification from "./Notification";

describe("Notification Component", () => {
  const mockOnClose = jest.fn();
  const successNotification = {
    id: "1",
    type: "success" as const,
    message: "Success message",
    duration: 5000,
  };

  const errorNotification = {
    id: "2",
    type: "error" as const,
    message: "Error message",
    duration: 5000,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("renders success notification correctly", () => {
    render(
      <Notification notification={successNotification} onClose={mockOnClose} />,
    );

    expect(screen.getByText("Success message")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /close notification/i }),
    ).toBeInTheDocument();
  });

  it("renders error notification correctly", () => {
    render(
      <Notification notification={errorNotification} onClose={mockOnClose} />,
    );

    expect(screen.getByText("Error message")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    render(
      <Notification notification={successNotification} onClose={mockOnClose} />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /close notification/i }),
    );

    // Wait for animation to complete
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(mockOnClose).toHaveBeenCalledWith(successNotification.id);
  });

  it("auto-closes after duration", () => {
    render(
      <Notification notification={successNotification} onClose={mockOnClose} />,
    );

    // Fast-forward time to just before auto-close
    act(() => {
      jest.advanceTimersByTime(4700);
    });

    // onClose should not have been called yet
    expect(mockOnClose).not.toHaveBeenCalled();

    // Fast-forward to after auto-close (duration - animation time + animation time)
    act(() => {
      jest.advanceTimersByTime(600);
    });

    // onClose should have been called
    expect(mockOnClose).toHaveBeenCalledWith(successNotification.id);
  });

  it("does not auto-close with Infinity duration", () => {
    const infiniteNotification = {
      ...successNotification,
      duration: Infinity,
    };

    render(
      <Notification
        notification={infiniteNotification}
        onClose={mockOnClose}
      />,
    );

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    // onClose should not have been called
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("displays the correct icon for each notification type", () => {
    const { rerender } = render(
      <Notification notification={successNotification} onClose={mockOnClose} />,
    );

    expect(screen.getByText("✓")).toBeInTheDocument();

    rerender(
      <Notification notification={errorNotification} onClose={mockOnClose} />,
    );

    expect(screen.getByText("✕")).toBeInTheDocument();

    rerender(
      <Notification
        notification={{ ...successNotification, type: "warning" as const }}
        onClose={mockOnClose}
      />,
    );

    expect(screen.getByText("⚠")).toBeInTheDocument();

    rerender(
      <Notification
        notification={{ ...successNotification, type: "info" as const }}
        onClose={mockOnClose}
      />,
    );

    expect(screen.getByText("ℹ")).toBeInTheDocument();
  });

  it("has correct accessibility attributes", () => {
    render(
      <Notification notification={successNotification} onClose={mockOnClose} />,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
