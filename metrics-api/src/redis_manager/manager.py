from loguru import logger
from redis import Redis, StrictRedis
from src.config import CONFIG


class RedisManager:

    def __init__(self):
        self.redis: StrictRedis | None = None
        self.connect_to_redis(True)

    def connect_to_redis(self, init=False):
        if not init:
            return self.redis is not None
        try:
            self.redis: Redis = StrictRedis(host=CONFIG.REDIS.HOST, port=CONFIG.REDIS.PORT, db=CONFIG.REDIS.DB,
                                            charset='utf-8', decode_responses=True)
            test = self.redis.hgetall(f'devices:{1}')
            return True
        except Exception as e:
            logger.error('COULD NOT CONNECT TO REDIS')
            self.redis = None
            return False

    def get_device_metric(self, device_id: int):
        if not self.connect_to_redis():
            return {}
        # try:
        device_dict = self.redis.hgetall(f'devices:{device_id}')
        # except Exception as e:
        #     logger.error(f'ERROR DURING HGET REDIS OPERATION: {e}')
        #     return {}
        return device_dict

    def set_device_metric(self, device_id: int, value: int):
        if not self.connect_to_redis():
            return
        # try:
        self.redis.hset(f'devices:{device_id}', mapping={'metric': value, 'new': 'False'})
        # except Exception as e:
        #     logger.error(f'ERROR DURING HSET REDIS OPERATION: {e}')
        #     return False


if __name__ == '__main__':
    print(RedisManager().get_device_metric(100))
