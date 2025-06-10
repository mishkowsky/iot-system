// Device types
export type DeviceType = "bulb" | "sensor";

export interface Device {
  id: number;
  name: string;
  type: DeviceType;
  is_on?: boolean;
  brightness?: number;
  value?: number;
  power?: number;
  luminous_efficiency?: number;
  room_id?: number | null;
  metrics?: DeviceMetric[];
}

export interface DeviceMetric {
  timestamp: string;
  value: number;
}

// Room types
export interface Room {
  id: number;
  name: string;
  floor_id: number | null;
  start_time: string;
  end_time: string;
  devices: Device[];
  target_illuminance: number;
}

export interface RoomCreate {
  name: string;
  floor_id: number;
  start_time: string;
  end_time: string;
}

export interface RoomUpdate {
  name: string;
  start_time: string;
  end_time: string;
  target_illuminance?: number;
}

// Floor types
export interface Floor {
  id: number;
  name: string;
}

// Component props types
export interface FloorSelectorProps {
  floors: Floor[];
  selectedFloor: number | null;
  onFloorChange: (floorId: number) => void;
}

export interface DeviceItemProps {
  device: Device;
  room?: Room;
  onDeviceClick: (device: Device) => void;
  onToggleDevice: (device: Device) => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
}

export interface RoomCardProps {
  room: Room;
  onEditRoom: (room: Room) => void;
  onDeleteRoom: (room: Room) => void;
  onDeviceClick: (device: Device) => void;
  onToggleDevice: (device: Device) => void;
  onDropDevice: (e: React.DragEvent<HTMLDivElement>, roomId: number) => void;
}

export interface UnassignedDevicesProps {
  devices: Device[];
  onRefresh: () => void;
  onAddDevice: () => void;
  onDeviceDrop: (e: React.DragEvent<HTMLElement>) => void;
  onDeviceDrag: (e: React.DragEvent<HTMLDivElement>, deviceId: number) => void;
  onDeviceClick: (device: Device) => void;
  onToggleDevice: (device: Device) => void;
}

export interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export interface NewRoomModalProps {
  onClose: () => void;
  onCreateRoom: (name: string, startTime: string, endTime: string) => void;
}

export interface EditRoomModalProps {
  room: Room;
  onClose: () => void;
  onUpdateRoom: (
    roomId: number,
    name: string,
    startTime: string,
    endTime: string,
  ) => void;
}

export interface DeleteRoomModalProps {
  room: Room;
  onClose: () => void;
  onDeleteRoom: (roomId: number) => void;
}

export interface DeviceDetailsModalProps {
  device: Device;
  onClose: () => void;
  onDelete: (deviceId: number) => void;
}

export interface NewDeviceModalProps {
  onClose: () => void;
  onCreateDevice: (name: string, type: DeviceType) => void;
}
