from datetime import datetime
from pydantic import BaseModel


class MetricBase(BaseModel):
    timestamp: datetime
    value: int


class MetricCreate(MetricBase):
    pass


class Metric(MetricCreate):
    device_id: int
