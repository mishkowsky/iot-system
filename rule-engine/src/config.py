import os
from dataclasses import dataclass
from dotenv import load_dotenv
from src.rabbit_mq_manager.config import RabbitMQConfig
from src.redis_manager.config import RedisConfig

load_dotenv()


@dataclass(frozen=True)
class Config:

    APP_NAME: str
    APP_PORT: int
    APP_HOST: str
    REDIS: RedisConfig
    RABBIT_MQ: RabbitMQConfig
    DEVICES_API_URL: str
    METRICS_API_URL: str
    ILLUMINANCE_DELTA: int


CONFIG = Config(
    APP_NAME="main",
    APP_PORT=int(os.getenv("APP_PORT", "8000")),
    APP_HOST=os.getenv("APP_HOST", "0.0.0.0"),
    REDIS=RedisConfig(
        HOST=os.getenv("REDIS_HOST", "localhost"),
        PORT=os.getenv("REDIS_PORT", 6379),
        DB=os.getenv("REDIS_DB", 0)),
    RABBIT_MQ=RabbitMQConfig(
        HOST=os.getenv("RABBITMQ_HOST", "localhost"),
        QUEUE_NAME=os.getenv("RABBITMQ_QUEUE", "iot-device-metrics")),
    METRICS_API_URL=os.getenv("METRICS_API_URL", "http://localhost:8000"),
    DEVICES_API_URL=os.getenv("DEVICES_API_URL", "http://localhost:8001"),
    ILLUMINANCE_DELTA=25
)

if __name__ == '__main__':
    print(CONFIG.RABBIT_MQ.HOST)
