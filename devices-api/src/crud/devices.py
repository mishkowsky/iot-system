from typing import Union

from sqlalchemy.orm import Session
from src.dao.models import Device, Sensor, Bulb
from src.routers import schemas
from src.routers.schemas import DeviceType


def get_devices(db: Session, room_id: int = None):
    query = db.query(Device)
    if room_id is not None:
        query = query.filter(Device.room_id == room_id)
    return query.order_by(Device.name).all()


def get_device_by_id(db: Session, device_id: int = None):
    return db.query(Device).filter(Device.id == device_id).first()


def get_unassigned_devices(db: Session):
    return db.query(Device).filter(Device.room_id == None).order_by(Device.name).all()


def create_device(db: Session, device: schemas.DeviceCreate):
    if device.type == DeviceType.bulb:
        db_device = Bulb(**device.dict())
    else:
        db_device = Sensor(**device.dict())
    db.add(db_device)
    db.commit()
    db.refresh(db_device)
    return db_device


def update_device(db: Session, device_id: int, device_data: Union[schemas.BulbUpdate, schemas.SensorUpdate]): #schemas.DeviceUpdate):
    if isinstance(device_data, schemas.BulbUpdate):
        db_device = db.query(Bulb).filter(Bulb.id == device_id).first()
    else:
        db_device = db.query(Sensor).filter(Sensor.id == device_id).first()
    if db_device:
        for key, value in device_data.dict(exclude_unset=True).items():
            setattr(db_device, key, value)
        db.commit()
        db.refresh(db_device)
    return db_device


def delete_device(db: Session, device_id: int):
    db_device = db.query(Device).filter(Device.id == device_id).first()
    if db_device:
        db.delete(db_device)
        db.commit()
    return db_device


def assign_device_to_room(db: Session, device_id: int, room_id: int):
    db_device = db.query(Device).filter(Device.id == device_id).first()
    if db_device:
        db_device.room_id = room_id
        db.commit()
        db.refresh(db_device)
    return db_device


def unassign_device(db: Session, device_id: int):
    db_device = db.query(Device).filter(Device.id == device_id).first()
    if db_device:
        db_device.room_id = None
        db.commit()
        db.refresh(db_device)
    return db_device
