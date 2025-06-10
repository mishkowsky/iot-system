from enum import Enum


class DeviceType(Enum):
    bulb = 'bulb'
    sensor = 'sensor'

class Device:

    def __init__(self, id: int, name: str, room_id: int, type: str):
        self.id = id
        self.name = name
        self.room_id = room_id
        self.type = DeviceType(type)

    # def loop_method(self):
    #     while(True):
    #
    #
    # def start_in_thread(self):
    #     Thread()
