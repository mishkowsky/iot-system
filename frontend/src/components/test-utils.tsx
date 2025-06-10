import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { NotificationProvider } from "./NotificationContext";

// Custom render function that includes providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => {
  const AllProviders: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => {
    return <NotificationProvider>{children}</NotificationProvider>;
  };

  return render(ui, { wrapper: AllProviders, ...options });
};

// Mock response generator for API tests
const mockApiResponse = <T,>(
  data: T,
  status = 200,
  statusText = "OK",
): Response => {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Headers(),
    redirected: false,
    type: "basic",
    url: "",
    clone: function () {
      return this;
    },
    body: null,
    bodyUsed: false,
    arrayBuffer: async () => new ArrayBuffer(0),
    blob: async () => new Blob(),
    formData: async () => new FormData(),
  } as Response;
};

// Mock data generators
const createMockFloor = (id: number, name: string) => ({
  id,
  name,
});

const createMockDevice = (
  id: number,
  name: string,
  type: "bulb" | "sensor",
  roomId?: number,
) => ({
  id,
  name,
  type,
  room_id: roomId,
  is_on: type === "bulb" ? false : undefined,
  brightness: type === "bulb" ? 50 : undefined,
  value: type === "sensor" ? 500 : undefined,
  power: type === "bulb" ? 10 : undefined,
  luminous_efficiency: type === "bulb" ? 95 : undefined,
});

const createMockRoom = (
  id: number,
  name: string,
  floorId: number,
  devices: any[] = [],
) => ({
  id,
  name,
  floor_id: floorId,
  start_time: "09:00",
  end_time: "17:00",
  devices,
  targetIlluminance: 500,
});

const createMockMetric = (timestamp: string, value: number) => ({
  timestamp,
  value,
});

// Re-export everything from RTL
export * from "@testing-library/react";
export {
  customRender as render,
  mockApiResponse,
  createMockFloor,
  createMockDevice,
  createMockRoom,
  createMockMetric,
};
