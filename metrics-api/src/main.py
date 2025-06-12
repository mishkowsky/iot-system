from datetime import datetime
from typing import List, Optional
import socket
import uvicorn
from fastapi import APIRouter
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from src import prometheus
from src.config import CONFIG
from src.database import MongoDB
from src.prometheus import REQUESTS
from src.rabbit_mq_manager.monitor import RabbitMQManager
from src.redis_manager.manager import RedisManager
from src.schemas import Metric, MetricCreate

app = FastAPI(title=CONFIG.APP_NAME)

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

router = APIRouter()
redis_manager = RedisManager()
rabbit_mq_manager = RabbitMQManager()
db = MongoDB()
hostname = socket.gethostname()


@router.post("/", response_model=Metric)
def create_device_metric(device_id: int, metric: MetricCreate):
    REQUESTS.labels(hostname=hostname).inc()
    created_entity = db.create_metrics_entry(device_id, metric)
    rabbit_mq_manager.publish_data(created_entity)
    redis_manager.set_device_metric(device_id, metric.value)
    logger.info(f'CREATED METRIC {metric}')
    return created_entity


@router.get("/", response_model=List[Metric])
def get_device_metrics_history(device_id: int,
                               start_time: datetime = None, end_time: datetime = None):
    REQUESTS.labels(hostname=hostname).inc()
    return db.get_device_metrics(device_id, start_time, end_time)


@router.get("/latest", response_model=Optional[int])
def get_device_latest_metric(device_id: int):
    REQUESTS.labels(hostname=hostname).inc()
    metric_dict = redis_manager.get_device_metric(device_id)
    if len(metric_dict) == 0:
        device_metric_dict = db.get_device_latest_metric(device_id)
        if device_metric_dict:
            redis_manager.set_device_metric(device_id, int(device_metric_dict['value']))
            return device_metric_dict['value']
        else:
            return -1
    else:
        device_metric = int(metric_dict['metric'])
        if metric_dict['new'] == 'True':
            db.create_metrics_entry(device_id, MetricCreate(value=device_metric, timestamp=datetime.now()))
            redis_manager.set_device_metric(device_id, device_metric)
            return device_metric
        else:
            return device_metric


app.include_router(router, prefix="/api/metrics", tags=["Device Metrics"])
app.include_router(prometheus.router, tags=["Prometheus metrics"])

if __name__ == '__main__':
    logger.add(f"logs/logs.txt", serialize=True)
    logger.info('METRICS API STARTED')
    uvicorn.run(app, port=CONFIG.APP_PORT, host=CONFIG.APP_HOST)
