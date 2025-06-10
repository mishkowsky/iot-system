import requests
from loguru import logger

from src.config import CONFIG


def get_device_latest_metric(device_metric_name: str, device_id: int) -> int:
    api_url = f'{CONFIG.METRIC_API_URL}/api/metrics/latest?device_id={device_id}'
    try:
        response = requests.get(api_url)
        response.raise_for_status()
        data = response.json()

        return data if data else -1
    except requests.RequestException as e:
        logger.error(f"API REQUEST TO {api_url} failed: {e}")
        return -1
