from enum import Enum
from typing import Optional, List, Union, Literal

from pydantic import BaseModel


class DeviceType(str, Enum):
    bulb = "bulb"
    sensor = "sensor"


class DeviceBase(BaseModel):
    name: Optional[str] = None


class DeviceCreate(DeviceBase):
    type: DeviceType
    room_id: Optional[int] = None


class DeviceUpdate(DeviceBase):
    pass


class Device(DeviceBase):
    id: Optional[int] = None
    type: Optional[DeviceType] = None
    room_id: Optional[int] = None

    class Config:
        orm_mode = True


class Sensor(Device):
    type: Literal["sensor"]
    pass


class SensorUpdate(DeviceUpdate):
    pass


class BulbBase(Device):
    is_on: Optional[bool] = False


class Bulb(BulbBase):
    type: Literal["bulb"]
    power: Optional[int] = None
    luminous_efficiency: Optional[int] = None
    # is_on: Optional[bool] = False
    brightness: Optional[int] = None


class BulbUpdate(BulbBase):
    pass


class RoomBase(BaseModel):
    name: Optional[str] = None
    target_illuminance: Optional[int] = 0
    floor_id: Optional[int] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None


class RoomCreate(RoomBase):
    pass


class RoomUpdate(RoomBase):
    pass


class Room(RoomBase):
    id: int
    devices: List[Union[Bulb, Sensor]] = []
    devices_polymorphic: List[Union[Bulb, Sensor]] = []

    class Config:
        orm_mode = True


class FloorBase(BaseModel):
    name: str


class FloorCreate(FloorBase):
    pass


class FloorUpdate(FloorBase):
    pass


class Floor(FloorBase):
    id: int

    class Config:
        orm_mode = True
