import requests
from loguru import logger

from src.config import CONFIG
from src.schemas import Room


def get_room_by_device_id(device_id: int) -> Room | None:
    room_info_response = requests.get(f'{CONFIG.DEVICES_API_URL}/api/devices/{device_id}/room')
    if room_info_response.status_code == 404:
        return None
    room_info_dict = room_info_response.json()
    return Room.model_validate(room_info_dict)
