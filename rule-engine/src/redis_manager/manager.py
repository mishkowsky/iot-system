from redis import Redis, StrictRedis

from src.config import CONFIG


class RedisManager:

    def __init__(self):
        self.redis: Redis = StrictRedis(host=CONFIG.REDIS.HOST, port=CONFIG.REDIS.PORT, db=CONFIG.REDIS.DB,
                                        encoding='utf-8', decode_responses=True)

    def adjust_bulb_brightness(self, bulb_id: int, brightness_adjustment: int):
        last_brightness_str = self.redis.hget(f'devices:{bulb_id}', 'metric')
        if last_brightness_str is None:
            last_brightness = 0
        else:
            last_brightness = int(last_brightness_str)
        new_brightness = max(min(last_brightness + brightness_adjustment, 100), 0)
        self.redis.hset(f'devices:{bulb_id}', mapping={'metric': str(new_brightness), 'new': 'True'})
