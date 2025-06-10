import React from "react";
import { render, screen, fireEvent } from "./test-utils";
import Modal from "./Modal";

describe("Modal Component", () => {
  const mockOnClose = jest.fn();
  const modalTitle = "Test Modal";
  const modalContent = "This is test content";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with title and content", () => {
    render(
      <Modal title={modalTitle} onClose={mockOnClose}>
        <div>{modalContent}</div>
      </Modal>,
    );

    expect(screen.getByText(modalTitle)).toBeInTheDocument();
    expect(screen.getByText(modalContent)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /close modal/i }),
    ).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    render(
      <Modal title={modalTitle} onClose={mockOnClose}>
        <div>{modalContent}</div>
      </Modal>,
    );

    fireEvent.click(screen.getByRole("button", { name: /close modal/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape key is pressed", () => {
    render(
      <Modal title={modalTitle} onClose={mockOnClose}>
        <div>{modalContent}</div>
      </Modal>,
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("has correct ARIA attributes for accessibility", () => {
    render(
      <Modal title={modalTitle} onClose={mockOnClose}>
        <div>{modalContent}</div>
      </Modal>,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("focuses the first focusable element when opened", () => {
    render(
      <Modal title={modalTitle} onClose={mockOnClose}>
        <button>First Button</button>
        <button>Second Button</button>
      </Modal>,
    );

    // The close button should be focused first as it's the first focusable element
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: /close modal/i }),
    );
  });

  it("traps focus within the modal", () => {
    render(
      <Modal title={modalTitle} onClose={mockOnClose}>
        <button>First Button</button>
        <button>Last Button</button>
      </Modal>,
    );

    const closeButton = screen.getByRole("button", { name: /close modal/i });
    const firstButton = screen.getByText("First Button");
    const lastButton = screen.getByText("Last Button");

    // Start with close button focused
    closeButton.focus();

    // Tab to first button
    fireEvent.keyDown(closeButton, { key: "Tab" });
    expect(document.activeElement).toBe(firstButton);

    // Tab to last button
    fireEvent.keyDown(firstButton, { key: "Tab" });
    expect(document.activeElement).toBe(lastButton);

    // Tab should cycle back to close button
    fireEvent.keyDown(lastButton, { key: "Tab" });
    expect(document.activeElement).toBe(closeButton);

    // Shift+Tab from close button should go to last button
    fireEvent.keyDown(closeButton, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(lastButton);
  });
});
