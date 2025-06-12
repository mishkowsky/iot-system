from datetime import datetime, timedelta
import random

from loguru import logger

from src.database import MongoDB
from src.redis_manager.manager import RedisManager
from src.schemas import Metric


def create_test_entities():
    db = MongoDB()
    init_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=30)

    room_id_counter = 0
    device_id_counter = 1

    latest_device_metrics: dict[int, int] = dict()
    for i in range(0, 10):  # floors
        rooms_count = 10
        logger.info(f'NEXT_DEVICE_ID TO CREATE: {device_id_counter}')
        for j in range(0, rooms_count):  # rooms
            room_id_counter += 1
            device_count = 16
            for m in range(0, device_count):  # devices
                device_id = device_id_counter
                device_id_counter += 1

                max_value = 1000 if m == 0 else 100
                next_value = random.randint(0, max_value)
                metrics_per_device_count = 1000
                for n in range(0, metrics_per_device_count):  # metrics
                    next_timestamp = init_date + timedelta(days=30) * n / metrics_per_device_count
                    next_value = next_value + random.randint(int(-0.15 * max_value), int(0.15 * max_value))
                    next_value = min(max(0, next_value), max_value)
                    metric = Metric(value=next_value, timestamp=next_timestamp, device_id=device_id)
                    db.metrics_collection.insert_one(metric.model_dump())
                    latest_device_metrics[device_id] = next_value

    rm = RedisManager()

    for device_id, latest_metric in latest_device_metrics.items():
        rm.set_device_metric(device_id, latest_metric)


if __name__ == '__main__':
    create_test_entities()
