import time
from datetime import datetime
import requests
from loguru import logger

API_BASE_URL = 'http://localhost'


def create_entities():
    device_id_counter = 1
    floors = requests.get
    for i in range(0, 10):
        name = 'ground floor' if i == 0 else '1st floor' if i == 1 else '2nd floor' if i == 2 else f'{i}th floor'



        if floor_db is None:
            floor = requests.post(f'{API_BASE_URL}/api/floors/', json={'name': name}).json()
            floor_db = Floor(level=i, name=name)
            db.add(floor_db)
            db.commit()
            db.refresh(floor_db)
        rooms_count = 10
        for j in range(0, rooms_count):
            room_name = f'{i}_{j} room'
            room_db = db.query(Room).filter_by(name=room_name, floor=floor_db).one_or_none()
            if room_db is None:
                room_db = Room(name=room_name, floor=floor_db)
                db.add(room_db)
                db.commit()
                db.refresh(room_db)
            device_count = 10
            for m in range(0, device_count):
                device_id = device_id_counter
                device_id_counter += 1

                device_name = f'{i}_{j}_{m} sensor' if m == 0 else f'{i}_{j}_{m} bulb'
                device = db.query(Device).filter_by(name=device_name).one_or_none()
                if device is None:
                    if m == 0:
                        device_type = DeviceType.sensor
                        device = Sensor(name=device_name, type=device_type, room=room_db)
                    else:
                        device_type = DeviceType.bulb
                        device = Bulb(name=device_name, type=device_type, room=room_db,
                                      luminous_efficiency=100, power=100)
                    db.add(device)
                    logger.debug(f'DEVICE {device_name} ADDED')
                    db.commit()
                    db.refresh(device)

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
    create_entities()
