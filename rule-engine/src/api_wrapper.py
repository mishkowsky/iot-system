from datetime import datetime

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


def adjust_bulbs_brightness(bulbs_ids: list[int], adjustment: int):

    logger.debug(f'ADJUSTING BULB {bulbs_ids} FOR {adjustment}')
    if len(bulbs_ids) == 0:
        return

    requests.post(f'{CONFIG.METRICS_API_URL}/api/metrics/adjustment?adjustment={adjustment}', json=bulbs_ids)
    # m = get_device_latest_metric(device_id)
    # new_m = max(min(m + adjustment, 100), 0)
    # post_decice_metric(device_id, new_m)
    logger.debug(f'ADJUSTED BULB {bulbs_ids} FOR {adjustment}')


def post_decice_metric(device_id: int, metric_value: int):
    logger.debug(f'POSTING NEW METRIC {device_id}: {metric_value}')
    res = requests.post(f'{CONFIG.METRICS_API_URL}/api/metrics/?device_id={device_id}&is_bulb=true', json={
        "value": metric_value,
        "timestamp": datetime.now().isoformat()
    })
    return res.status_code == 200


def get_device_latest_metric(device_id: int) -> int:
    logger.debug(f'GETTING METRIC FOR {device_id}')
    api_url = f'{CONFIG.METRICS_API_URL}/api/metrics/latest?device_id={device_id}'
    try:
        response = requests.get(api_url)
        response.raise_for_status()
        data = response.json()
        return data if data else -1
    except requests.RequestException as e:
        logger.error(f"API REQUEST TO {api_url} failed: {e}")
        return -1


if __name__ == '__main__':
    # CONFIG.DEVICES_API_URL = 'localhost'
    for i in range(1, 1600):
        print(get_room_by_device_id(i))
