import os
from datetime import datetime, timedelta
import datetime
import random
from typing import Optional, List

import pymongo

from src.config import CONFIG
from src.schemas import MetricCreate, Metric
from pymongo import MongoClient


class MongoDB:

    def __init__(self):
        client = MongoClient(CONFIG.DB_URI, w=0)
        mongo_db = client["metrics_db"]
        self.metrics_collection = mongo_db["metrics"]
        self.metrics_collection.create_index([("device_id"), ("timestamp", pymongo.DESCENDING)])

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
