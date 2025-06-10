import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from datetime import datetime

from src.database import MongoDB
from src.main import app
from src.rabbit_mq_manager.monitor import RabbitMQManager
from src.redis_manager.manager import RedisManager
from src.schemas import MetricCreate


client = TestClient(app)


@pytest.fixture
def sample_metric():
    return {"value": 42, "timestamp": datetime.now().isoformat()}


@pytest.fixture
def metric_obj():
    return MetricCreate(value=42, timestamp=datetime.now())


# --------------------
# RedisManager Tests
# --------------------

def test_set_device_metric_redis(mocker):
    mock_redis = mocker.patch("src.redis_manager.manager.StrictRedis").return_value
    redis_mgr = RedisManager()
    redis_mgr.set_device_metric(device_id=1, value=42)

    mock_redis.hset.assert_called_once_with(
        "devices:1", mapping={"metric": "42", "new": "False"}
    )


def test_get_device_metric_redis(mocker):
    mock_redis = mocker.patch("src.redis_manager.manager.StrictRedis").return_value
    mock_redis.hgetall.return_value = {"metric": "42", "new": "False"}
    redis_mgr = RedisManager()

    result = redis_mgr.get_device_metric(1)
    assert result == {"metric": "42", "new": "False"}
    mock_redis.hgetall.assert_called_once_with("devices:1")


# ------------------------
# MongoDB Tests
# ------------------------

def test_create_metrics_entry_mongodb(mocker, metric_obj):
    mock_collection = MagicMock()
    mock_client = mocker.patch("src.database.MongoClient").return_value
    mock_client.__getitem__.return_value.__getitem__.return_value = mock_collection

    db = MongoDB()
    mock_collection.insert_one.return_value = None
    metric_dict = metric_obj.dict()
    metric_dict["device_id"] = 1

    with patch("src.schemas.Metric.validate", return_value=metric_dict):
        result = db.create_metrics_entry(1, metric_obj)

    assert result["device_id"] == 1
    mock_collection.insert_one.assert_called_once()


def test_get_device_metrics_mongodb(mocker):
    mock_collection = MagicMock()
    mock_cursor = MagicMock()
    mock_cursor.sort.return_value = [{"value": 1}, {"value": 2}]
    mock_collection.find.return_value = mock_cursor

    mock_client = mocker.patch("src.database.MongoClient").return_value
    mock_client.__getitem__.return_value.__getitem__.return_value = mock_collection

    db = MongoDB()
    result = db.get_device_metrics(1)

    assert isinstance(result, list)
    assert result[0]["value"] == 1


def test_get_device_latest_metric_db(mocker):
    mock_collection = MagicMock()
    mock_collection.find_one.return_value = {"value": 123}

    mock_client = mocker.patch("src.database.MongoClient").return_value
    mock_client.__getitem__.return_value.__getitem__.return_value = mock_collection

    db = MongoDB()
    result = db.get_device_latest_metric(1)
    assert result["value"] == 123


# ----------------------------
# RabbitMQManager Tests
# ----------------------------

def test_publish_data_rabbitmq(mocker, metric_obj):
    mock_connection = MagicMock()
    mock_channel = MagicMock()

    mock_pika = mocker.patch("src.rabbit_mq_manager.monitor.pika.BlockingConnection")
    mock_pika.return_value = mock_connection
    mock_connection.channel.return_value = mock_channel
    mock_connection.is_closed = False

    with patch("src.schemas.Metric.model_dump_json", return_value='{"value": 42}') as mock_json:
        rabbit_mgr = RabbitMQManager()
        metric = mocker.Mock()
        metric.model_dump_json.return_value = '{"value": 42}'
        rabbit_mgr.publish_data(metric)

        mock_channel.basic_publish.assert_called_once()


# -----------------------
# API Endpoint Tests
# -----------------------

def test_create_device_metric_endpoint(mocker, sample_metric):
    mock_db = mocker.patch("src.main.db")
    mock_rabbit = mocker.patch("src.main.rabbit_mq_manager")
    mock_redis = mocker.patch("src.main.redis_manager")

    mock_db.create_metrics_entry.return_value = {
        **sample_metric, "device_id": 1
    }

    response = client.post("/api/metrics/?device_id=1", json=sample_metric)
    assert response.status_code == 200
    assert response.json()["device_id"] == 1

    mock_db.create_metrics_entry.assert_called_once()
    mock_rabbit.publish_data.assert_called_once()
    mock_redis.set_device_metric.assert_called_once()


def test_get_device_latest_metric_endpoint(mocker):
    mock_db = mocker.patch("src.main.db")
    mock_db.get_device_latest_metric_db.return_value = {
        "device_id": 1, "metric": 55, "timestamp": datetime.now().isoformat()
    }

    response = client.get("/api/metrics/latest?device_id=1")
    assert response.status_code == 200
    assert response.json()["device_id"] == 1
