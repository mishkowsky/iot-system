export interface Device {
  id: number;
  name: string;
  type: "bulb" | "sensor";
  is_on?: boolean;
  brightness?: number;
  is_active?: boolean;
  roomId?: number;
}

export interface Room {
  id: number;
  name: string;
  image?: string;
  bulbsOn: number;
  totalBulbs: number;
  devices?: Device[];
}

export interface DraggedDevice {
  id: number;
  room_id: number | null;
}

export interface SelectedDevice extends Device {
  room_id?: number | null;
}
