from loguru import logger
from redis import Redis, StrictRedis

from src.config import CONFIG


class RedisManager:

    def __init__(self):
        self.redis: StrictRedis | None = None
        self.connect_to_redis(True)

    def connect_to_redis(self, init=False):
        if self.redis is not None and not init:
            return True
        try:
            self.redis: Redis = StrictRedis(host=CONFIG.REDIS.HOST, port=CONFIG.REDIS.PORT, db=CONFIG.REDIS.DB,
                                            charset='utf-8', decode_responses=True)
            test = self.redis.hget(f'devices:{1}', 'metric')
            return True
        except Exception as e:
            self.redis = None
            return False

    def adjust_bulb_brightness(self, bulb_id: int, brightness_adjustment: int):
        if self.redis is None or not self.connect_to_redis():
            return False
        try:
            last_brightness_str = self.redis.hget(f'devices:{bulb_id}', 'metric')
        except Exception as e:
            logger.error(f'ERROR DURING REDIS OPERATION: {e}')
            return False
        if last_brightness_str is None:
            last_brightness = 0
        else:
            last_brightness = int(last_brightness_str)
        new_brightness = max(min(last_brightness + brightness_adjustment, 100), 0)
        self.redis.hset(f'devices:{bulb_id}', mapping={'metric': str(new_brightness), 'new': 'True'})
        return True
