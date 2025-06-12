
from threading import Lock

import pika
from loguru import logger

from src.config import CONFIG
from src.schemas import Metric


# class RabbitMQManager:
#
#     def __init__(self):
#         self.connection = None
#         self.channel = None
#         self.connect()
#         self.channel_lock = Lock()
#
#     def connect(self):
#         logger.debug(f'CONNECTING TO RABBITMQ AT {CONFIG.RABBIT_MQ.HOST}')
#         self.connection = pika.BlockingConnection(pika.ConnectionParameters(host=CONFIG.RABBIT_MQ.HOST))
#         self.channel = self.connection.channel()
#         self.channel.queue_declare(queue=CONFIG.RABBIT_MQ.QUEUE_NAME)
#
#     def publish_data(self, metric: Metric):
#         if not self.connection or self.connection.is_closed:
#             logger.warning('RABBITMQ CONNECTION IS DOWN; RECONNECTING')
#             self.connect()
#             self.publish_data(metric)
#             return
#         try:
#             res = self.channel.basic_publish(exchange='', routing_key=CONFIG.RABBIT_MQ.QUEUE_NAME,
#                                              body=metric.model_dump_json())  # json.dumps(data))
#         except Exception as e:
#             logger.error(f'EXCEPTION ON PUBLISH TO RABBITMQ: {e}')
#             self.connect()
#             self.publish_data(metric)

class RabbitMQManager:

    def publish_data(self, metric: Metric):
        # Connect to RabbitMQ server
        connection = pika.BlockingConnection(pika.ConnectionParameters(host=CONFIG.RABBIT_MQ.HOST))
        channel = connection.channel()

        # Make sure the queue exists
        channel.queue_declare(queue=CONFIG.RABBIT_MQ.QUEUE_NAME)

        # Publish the message
        channel.basic_publish(
            exchange='',
            routing_key=CONFIG.RABBIT_MQ.QUEUE_NAME,
            body=metric.model_dump_json(),
            properties=pika.BasicProperties(
                delivery_mode=2,  # Make message persistent
            )
        )

        # print(f" [x] Sent: {message}")
        connection.close()


# Example usage
if __name__ == "__main__":
    pass
    # publish_message("Hello, RabbitMQ!")
