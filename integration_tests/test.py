import time
from datetime import datetime
import requests
from loguru import logger

API_BASE_URL = 'http://localhost'


def run_test():
    floor = requests.post(f'{API_BASE_URL}/api/floors/', json={'name': 'test_floor'}).json()
    logger.debug(f'CREATED FLOOR: {floor}')

    room = requests.post(f'{API_BASE_URL}/api/rooms/',
                         json={'name': 'test_room', 'floor_id': floor['id'], 'target_illuminance': 500}).json()
    logger.debug(f'CREATED ROOM: {room}')

    sensor = requests.post(f'{API_BASE_URL}/api/devices/',
                           json={'name': 'test_sensor', 'room_id': room['id'], 'type': 'sensor'}).json()
    logger.debug(f'CREATED SENSOR: {sensor}')

    bulb = requests.post(f'{API_BASE_URL}/api/devices/',
                         json={'name': 'test_bulb', 'room_id': room['id'], 'type': 'bulb'}).json()
    logger.debug(f'CREATED BULB: {bulb}')

    bulb = requests.put(f'{API_BASE_URL}/api/devices/{bulb["id"]}', json={'is_on': 'true'}).json()
    logger.debug(f'UPDATED BULB: {bulb}')
    assert bulb['is_on']
    assert bulb['brightness'] < 0

    posted_metric = requests.post(f'{API_BASE_URL}/api/metrics/?device_id={sensor["id"]}', json={
        "value": 0,
        "timestamp": datetime.now().isoformat()
    }).json()
    assert posted_metric['value'] == 0

    time.sleep(5)

    bulb = requests.get(f'{API_BASE_URL}/api/devices/{bulb["id"]}').json()
    logger.debug(f'UPDATED BULB STATE" {bulb}')
    assert bulb['brightness'] > 0


if __name__ == '__main__':
    run_test()
