from redis import Redis, StrictRedis
from src.config import CONFIG


class RedisManager:

    def __init__(self):
        self.redis: Redis = StrictRedis(host=CONFIG.REDIS.HOST, port=CONFIG.REDIS.PORT, db=CONFIG.REDIS.DB,
                                        charset='utf-8', decode_responses=True)

    def get_device_metric(self, device_id: int):
        device_dict = self.redis.hgetall(f'devices:{device_id}')
        return device_dict

    def set_device_metric(self, device_id: int, value: int):
        self.redis.hset(f'devices:{device_id}', mapping={'metric': str(value), 'new': 'False'})


if __name__ == '__main__':
    print(RedisManager().get_device_metric(10))
