import time

from loguru import logger

from src.api_wrapper.api import get_devices, post_sensor_metric
from src.devices.base import Device
from src.devices.bulb import Bulb
from src.devices.sensor import Sensor


class System:

    def simulate(self):
        while True:
            time.sleep(1)

            devices = get_devices()

            sensors_to_simulate: list[Sensor] = []
            bulbs_per_room: dict[int, list[Bulb]] = dict()

            for device in devices:
                if device['type'] == 'sensor':
                    logger.debug(f'{device["name"]}')
                    logger.debug(device)
                    if device['room_id'] is not None:
                        sensors_to_simulate.append(Sensor(**device))
                else:
                    bulb = Bulb(**device)
                    if bulb.room_id not in bulbs_per_room.keys():
                        bulbs_per_room[bulb.room_id] = []
                    bulbs_per_room[bulb.room_id].append(bulb)

            for sensor in sensors_to_simulate:
                sensor.illuminance = 0
                if not sensor.room_id:
                    continue
                for bulb in bulbs_per_room[sensor.room_id]:
                    sensor.illuminance += max(bulb.brightness, 0) if bulb.brightness else 0
                response = post_sensor_metric(sensor)
                logger.debug(f'POSTED {response.status_code} {sensor.name} METRIC: {sensor.illuminance}')


if __name__ == '__main__':
    System().simulate()
