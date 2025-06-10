from datetime import datetime
from typing import Optional, Union, Annotated, Literal, List

from pydantic import BaseModel, Field


class Device(BaseModel):
    id: int
    name: str
    room_id: Optional[int]


class Bulb(Device):
    type: Literal["bulb"]
    is_on: bool
    power: Optional[int]
    luminous_efficiency: Optional[int]
    brightness: Optional[int]


class Sensor(Device):
    type: Literal["sensor"]
    # value: int


DeviceItem = Annotated[
    Union[Bulb, Sensor],
    Field(discriminator="type")
]


class Room(BaseModel):
    id: int
    name: str
    floor_id: int
    start_time: Optional[datetime]
    end_time: Optional[datetime]
    target_illuminance: Optional[int]
    devices: List[DeviceItem]


class IlluminanceSensorData(BaseModel):
    device_id: int
    value: int
    timestamp: datetime
