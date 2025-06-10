from dataclasses import dataclass


@dataclass(frozen=True)
class RabbitMQConfig:
    HOST: str
    QUEUE_NAME: str

