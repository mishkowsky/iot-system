from dataclasses import dataclass


@dataclass(frozen=True)
class RedisConfig:
    HOST: str
    PORT: int
    DB: int

