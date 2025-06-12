import pika
from loguru import logger
from src.config import CONFIG


def monitor(callback):
    while True:
        try:
            logger.debug(f'CONNECTING TO RABBITMQ AT {CONFIG.RABBIT_MQ.HOST}')
            connection = pika.BlockingConnection(pika.ConnectionParameters(host=CONFIG.RABBIT_MQ.HOST))
            channel = connection.channel()
            channel.queue_declare(queue=CONFIG.RABBIT_MQ.QUEUE_NAME)
            channel.basic_consume(queue=CONFIG.RABBIT_MQ.QUEUE_NAME, on_message_callback=callback, auto_ack=True)
            channel.start_consuming()
        except Exception as e:
            logger.error(f'ERROR WHEN CONSUMING RABBITMQ QUEUE: {e}')
        # monitor(callback)
