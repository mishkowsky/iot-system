import datetime

import requests

from src.devices.sensor import Sensor

API_BASE_URL = "localhost"


def get_floors():
    requests.get(f"http://{API_BASE_URL}/api/floors")


def get_devices():
    return requests.get(f'http://{API_BASE_URL}/api/devices').json()


def post_sensor_metric(sensor: Sensor):
    return requests.post(f'http://{API_BASE_URL}/api/metrics/?device_id={sensor.id}', json={
        "value": sensor.illuminance,
        "timestamp": datetime.datetime.now().isoformat()
    })
