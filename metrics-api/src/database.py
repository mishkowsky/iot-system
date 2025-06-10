import os
from datetime import datetime, timedelta
import datetime
import random
from typing import Optional, List

from src.config import CONFIG
from src.schemas import MetricCreate, Metric
from pymongo import MongoClient


class MongoDB:

    def __init__(self):
        print(MongoClient)
        client = MongoClient(CONFIG.DB_URI)
        mongo_db = client["metrics_db"]
        self.metrics_collection = mongo_db["metrics"]

    def create_metrics_entry(self, device_id: int, metric: MetricCreate) -> Metric:
        metric_dict = metric.dict()
        metric_dict['device_id'] = device_id
        self.metrics_collection.insert_one(metric_dict)
        return Metric.validate(metric_dict)

    def get_device_metrics(self, device_id: int,
                           start_time: Optional[datetime] = None,
                           end_time: Optional[datetime] = None) -> List[dict]:
        query = {'device_id': device_id}

        if start_time or end_time:
            query['timestamp'] = {}
            if start_time:
                query['timestamp']['$gte'] = start_time
            if end_time:
                query['timestamp']['$lte'] = end_time

        cursor = self.metrics_collection.find(query).sort('timestamp', 1)
        return list(cursor)

    def get_device_latest_metric(self, device_id: int) -> Optional[dict]:
        return self.metrics_collection.find_one({'device_id': device_id}, sort=[('timestamp', -1)])

    def create_test_entities(self):
        init_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=30)

        room_id_counter = 0
        device_id_counter = 1
        for i in range(0, 10):
            rooms_count = 10
            for j in range(0, rooms_count):
                room_id_counter += 1
                device_count = 10
                for m in range(0, device_count):
                    device_id = device_id_counter
                    device_id_counter += 1

                    if self.metrics_collection.count_documents({"device_id": device_id}) != 0:
                        continue
                    max_value = 1000 if m == 0 else 100
                    next_value = random.randint(0, max_value)
                    for n in range(0, 100):
                        next_timestamp = init_date + timedelta(days=30) * n / 100
                        next_value = next_value + random.randint(int(-0.15 * max_value), int(0.15 * max_value))
                        next_value = min(max(0, next_value), max_value)
                        metric = Metric(value=next_value, timestamp=next_timestamp, device_id=device_id)
                        self.metrics_collection.insert_one(metric.model_dump())
