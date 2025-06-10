import requests

from src.config import API_URL
from src.devices.base import Device


class Sensor(Device):

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.illuminance = 0

    # def post_data(self):
    #     requests.post(f"{API_URL}/{self.id}")
