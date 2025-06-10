import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime, timedelta
import json
from src.redis_manager.manager import RedisManager
from src.rule_engine import RuleEngine
from src.schemas import Room


@pytest.fixture
def fake_sensor_data():
    return {
        "device_id": 1,
        "value": 420,
        "timestamp": datetime.now().isoformat()
    }


@pytest.fixture
def fake_room_response(fake_sensor_data):
    now = datetime.fromisoformat(fake_sensor_data["timestamp"])
    return {
        "id": 10,
        "name": "Conference Room",
        "floor_id": 1,
        "start_time": (now - timedelta(minutes=5)).isoformat(),
        "end_time": (now + timedelta(minutes=5)).isoformat(),
        "target_illuminance": 500,
        "devices": [
            {
                "id": 101,
                "name": "Bulb 1",
                "type": "bulb",
                "room_id": 10,
                "is_on": True,
                "power": 60,
                "luminous_efficiency": 80,
                "brightness": 75
            },
            {
                "id": 102,
                "name": "Sensor 1",
                "type": "sensor",
                "room_id": 10,
                "value": 420
            }
        ]
    }


@patch("src.rule_engine.RedisManager")
@patch("src.rule_engine.get_room_by_device_id")
def test_process_message_adjusts_brightness(mock_get_room, mock_redis_mgr, fake_sensor_data, fake_room_response):
    mock_get_room.return_value = Room.model_validate(fake_room_response)

    mock_redis = MagicMock()
    mock_redis_mgr.return_value = mock_redis

    mock_redis.redis.hget.return_value = "70"

    engine = RuleEngine()
    body = json.dumps(fake_sensor_data).encode("utf-8")

    engine.process_next_message(ch=MagicMock(), method=MagicMock(), properties=MagicMock(), body=body)

    assert mock_redis.adjust_bulb_brightness.called
    mock_redis.adjust_bulb_brightness.assert_called_with(101, 8)  # ±1 margin


@patch("src.rule_engine.get_room_by_device_id")
def test_process_message_skips_if_out_of_time(mock_get_room, fake_sensor_data, fake_room_response):

    fake_room_response["start_time"] = (datetime.now() - timedelta(days=1)).isoformat()
    fake_room_response["end_time"] = (datetime.now() - timedelta(hours=20)).isoformat()
    mock_get_room.return_value = Room.model_validate(fake_room_response)

    engine = RuleEngine()

    body = json.dumps(fake_sensor_data).encode("utf-8")
    with patch.object(RedisManager, "adjust_bulb_brightness") as mock_adjust:
        engine.process_next_message(MagicMock(), MagicMock(), MagicMock(), body)
        mock_adjust.assert_not_called()


@patch("src.rule_engine.get_room_by_device_id")
def test_process_message_skips_if_illuminance_within_tolerance(mock_get_room, fake_sensor_data, fake_room_response):

    fake_sensor_data["value"] = 498
    fake_room_response["target_illuminance"] = 500
    mock_get_room.return_value = Room.model_validate(fake_room_response)

    engine = RuleEngine()

    body = json.dumps(fake_sensor_data).encode("utf-8")
    with patch.object(RedisManager, "adjust_bulb_brightness") as mock_adjust:
        engine.process_next_message(MagicMock(), MagicMock(), MagicMock(), body)
        mock_adjust.assert_not_called()
