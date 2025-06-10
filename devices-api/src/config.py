import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Config:
    NAME: str
    APP_NAME: str
    APP_PORT: int
    APP_HOST: str
    DB_URI: str
    METRIC_API_URL: str


CONFIG = Config(
    NAME="main",
    APP_NAME=os.getenv("APP_NAME", "devices-api"),
    APP_PORT=int(os.getenv("APP_PORT", 8000)),
    APP_HOST=os.getenv("APP_HOST", "0.0.0.0"),
    DB_URI=os.getenv("DB_URI", "postgresql://postgres:postgres@localhost/iot-service"),
    METRIC_API_URL=os.getenv("METRICS_API_URL", "http://localhost")
)
