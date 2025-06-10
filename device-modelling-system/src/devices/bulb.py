from src.devices.base import Device


class Bulb(Device):

    def __init__(self, brightness: int = 0, is_on: bool = False, power: int = 0,
                 luminous_efficiency: int = 0, **kwargs):
        super().__init__(**kwargs)
        self.is_on = is_on
        self.power = power
        self.luminous_efficiency = luminous_efficiency
        self.brightness = brightness

    # def fetch_data(self):

