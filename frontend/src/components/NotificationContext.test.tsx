import React from "react";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import { NotificationProvider, useNotification } from "./NotificationContext";

// Test component that uses the notification context
const TestComponent = () => {
  const { addNotification, notifications, removeNotification } =
    useNotification();

  return (
    <div>
      <button
        onClick={() => addNotification("success", "Success message")}
        data-testid="add-success"
      >
        Add Success
      </button>
      <button
        onClick={() => addNotification("error", "Error message")}
        data-testid="add-error"
      >
        Add Error
      </button>
      <button
        onClick={() => addNotification("info", "Info message", 1000)}
        data-testid="add-info"
      >
        Add Info
      </button>
      <button
        onClick={() => addNotification("warning", "Warning message", Infinity)}
        data-testid="add-warning"
      >
        Add Warning
      </button>
      {notifications.length > 0 && (
        <button
          onClick={() => removeNotification(notifications[0].id)}
          data-testid="remove-first"
        >
          Remove First
        </button>
      )}
      <div data-testid="notification-count">{notifications.length}</div>
    </div>
  );
};

describe("NotificationContext", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("provides notification context to children", () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>,
    );

    expect(screen.getByTestId("notification-count")).toHaveTextContent("0");
    expect(screen.getByTestId("add-success")).toBeInTheDocument();
  });

  it("adds a notification when addNotification is called", () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>,
    );

    fireEvent.click(screen.getByTestId("add-success"));

    expect(screen.getByTestId("notification-count")).toHaveTextContent("1");
    expect(screen.getByText("Success message")).toBeInTheDocument();
  });

  it("removes a notification when removeNotification is called", () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>,
    );

    fireEvent.click(screen.getByTestId("add-success"));
    expect(screen.getByTestId("notification-count")).toHaveTextContent("1");

    fireEvent.click(screen.getByTestId("remove-first"));
    expect(screen.getByTestId("notification-count")).toHaveTextContent("0");
  });

  it("automatically removes notifications after duration", async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>,
    );

    fireEvent.click(screen.getByTestId("add-info")); // 1000ms duration
    expect(screen.getByTestId("notification-count")).toHaveTextContent("1");

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(1100);
    });

    // Wait for state update
    await waitFor(() => {
      expect(screen.getByTestId("notification-count")).toHaveTextContent("0");
    });
  });

  it("does not auto-remove notifications with Infinity duration", () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>,
    );

    fireEvent.click(screen.getByTestId("add-warning")); // Infinity duration
    expect(screen.getByTestId("notification-count")).toHaveTextContent("1");

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    // Notification should still be there
    expect(screen.getByTestId("notification-count")).toHaveTextContent("1");
  });

  it("can add multiple notifications", () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>,
    );

    fireEvent.click(screen.getByTestId("add-success"));
    fireEvent.click(screen.getByTestId("add-error"));

    expect(screen.getByTestId("notification-count")).toHaveTextContent("2");
    expect(screen.getByText("Success message")).toBeInTheDocument();
    expect(screen.getByText("Error message")).toBeInTheDocument();
  });

  it("throws error when used outside provider", () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useNotification must be used within a NotificationProvider");

    // Restore console.error
    console.error = originalError;
  });
});
