import json
import threading

import uvicorn
from loguru import logger
from src.api_wrapper import get_room_by_device_id
from src.config import CONFIG
from src.prometheus_server import app
from src.rabbit_mq_manager.monitor import monitor
from src.redis_manager.manager import RedisManager
from src.schemas import IlluminanceSensorData  # Message


class RuleEngine:

    def __init__(self):
        self.redis = RedisManager()
        MAX_BRIGHTNESS_VALUE = 100
        MAX_ILLUMINANCE_VALUE = 1000
        self.GAIN_FACTOR = MAX_BRIGHTNESS_VALUE / MAX_ILLUMINANCE_VALUE

    def process_next_message(self, ch, method, properties, body):
        json_str = body.decode("utf-8")
        logger.info(f'PROCESSING {json_str}')
        next_data_dict = json.loads(json_str)
        sensor_data = IlluminanceSensorData.model_validate(next_data_dict)

        room = get_room_by_device_id(sensor_data.device_id)

        if room is None:
            logger.info('SKIPPING: SENSOR IS NOT ATTACHED TO ROOM')
            return

        if ((room.end_time is not None and room.end_time < sensor_data.timestamp)
                or (room.start_time is not None and room.start_time > sensor_data.timestamp)):
            logger.info('SKIPPING: ROOM STATUS IS NOT ACTIVE AT THE TIME, NO NEED TO ADJUST')
            return

        if not (room.target_illuminance - CONFIG.ILLUMINANCE_DELTA < sensor_data.value
                < room.target_illuminance + CONFIG.ILLUMINANCE_DELTA):
            error = room.target_illuminance - sensor_data.value
            adjustment = int(error * self.GAIN_FACTOR)

            adjusted_bulb_ids = []

            for device in room.devices:  # sensor_data.related_bulbs_ids.:
                if device.type == "bulb" and device.is_on is True:
                    self.redis.adjust_bulb_brightness(device.id, adjustment)
                    adjusted_bulb_ids.append(device.id)
            logger.info(f'ADJUSTED BRIGHTNESS OF {adjusted_bulb_ids} BULBS BY {adjustment}')
            return

    def start(self):
        t = threading.Thread(name=f'Thread-prometheus-server', target=uvicorn.run,
                             kwargs={'app': app, 'port': CONFIG.APP_PORT, 'host': CONFIG.APP_HOST})
        t.daemon = True
        t.start()
        # threading.Thread.run()
        # uvicorn.run(app, port=CONFIG.APP_PORT, host=CONFIG.APP_HOST)
        monitor(self.process_next_message)


if __name__ == '__main__':
    logger.add(f"logs/logs.txt", serialize=True)
    logger.info('RULE ENGINE STARTED')
    RuleEngine().start()
    print('hello')
