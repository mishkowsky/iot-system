from loguru import logger
from sqlalchemy.orm import Session
from src.dao.database import Base, engine, get_db
from src.dao.models import Floor, Room, Device, Sensor, Bulb, DeviceType


def create_test_entities(db: Session):
    Base.metadata.create_all(bind=engine)

    device_id_counter = 1
    for i in range(0, 10):
        name = 'ground floor' if i == 0 else '1st floor' if i == 1 else '2nd floor' if i == 2 else f'{i}th floor'
        floor_db = db.query(Floor).filter_by(level=i, name=name).one_or_none()
        if floor_db is None:
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


if __name__ == '__main__':
    create_test_entities(next(get_db()))
