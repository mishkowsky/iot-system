# from datetime import datetime
# from unittest.mock import patch, MagicMock
#
# import pytest
# from fastapi.testclient import TestClient
#
# from src.main import app
#
#
# @pytest.fixture
# def client():
#     return TestClient(app)
#
#
# @pytest.fixture
# def fake_metric():
#     return {
#         "illuminance": 123,
#         "timestamp": datetime.utcnow().isoformat()
#     }
#
#
# @pytest.fixture
# def mock_redis():
#     with patch("src.redis_manager.manager.StrictRedis") as mock_redis_cls:
#         mock_redis = MagicMock()
#         mock_redis_cls.return_value = mock_redis
#         yield mock_redis
#
#
# @pytest.fixture
# def mock_rabbitmq():
#     with patch("src.rabbit_mq_manager.monitor.pika.BlockingConnection") as mock_conn_cls:
#         mock_conn = MagicMock()
#         mock_channel = MagicMock()
#         mock_conn.channel.return_value = mock_channel
#         mock_conn.is_closed = False
#         mock_conn_cls.return_value = mock_conn
#         yield mock_channel
#
#
# @pytest.fixture
# def mock_mongo_insert():
#     with patch("src.database.Collection.insert_one") as mock_insert:
#         yield mock_insert
#
#
# @pytest.fixture
# def mock_get_metrics_collection():
#     with patch("src.database.get_metrics_collection") as mock_get_collection:
#         mock_collection = MagicMock()
#         mock_get_collection.return_value = mock_collection
#         yield mock_collection
from unittest.mock import MagicMock

import pytest


@pytest.fixture()
def mock_rabbit_mq(mocker):
    mock_connection = MagicMock()
    mock_channel = MagicMock()

    mock_pika = mocker.patch("src.rabbit_mq_manager.monitor.pika.BlockingConnection")
    mock_pika.return_value = mock_connection
    mock_connection.channel.return_value = mock_channel
    mock_connection.is_closed = False
