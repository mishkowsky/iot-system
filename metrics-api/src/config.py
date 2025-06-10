import os
from dataclasses import dataclass
from dotenv import load_dotenv
from src.rabbit_mq_manager.config import RabbitMQConfig
from src.redis_manager.config import RedisConfig

load_dotenv()


@dataclass(frozen=True)
class Config:
    NAME: str
    APP_NAME: str
    APP_PORT: int
    APP_HOST: str
    DB_URI: str
    REDIS: RedisConfig
    RABBIT_MQ: RabbitMQConfig


CONFIG = Config(
    NAME="main",
    APP_NAME=os.getenv("APP_NAME", "metrics-api"),
    APP_PORT=int(os.getenv("APP_PORT", 8000)),
    APP_HOST=os.getenv("APP_HOST", "0.0.0.0"),
    DB_URI=os.environ.get("DB_URI"),
    REDIS=RedisConfig(
        HOST=os.getenv("REDIS_HOST", "localhost"),
        PORT=os.getenv("REDIS_PORT", 6379),
        DB=os.getenv("REDIS_DB", 0)
    ),
    RABBIT_MQ=RabbitMQConfig(
        HOST=os.getenv("RABBITMQ_HOST", "localhost"),
        QUEUE_NAME=os.getenv("RABBITMQ_QUEUE", "iot-device-metrics")
    )
)

if __name__ == '__main__':
    print(CONFIG.RABBIT_MQ.HOST)
