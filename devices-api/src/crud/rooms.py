from sqlalchemy.orm import Session
from src.dao.models import Room, Device
from src.routers import schemas


def get_rooms(db: Session, floor_id: int = None):
    query = db.query(Room)
    if floor_id is not None:
        query = query.filter(Room.floor_id == floor_id)
    return query.order_by(Room.name).all()


def get_room(db: Session, room_id: int):
    return db.query(Room).filter(Room.id == room_id).one_or_none()


def get_room_by_device_id(db: Session, device_id: int):
    return db.query(Room).join(Device).filter(Device.id == device_id).one_or_none()


def create_room(db: Session, room: schemas.RoomCreate):
    db_room = Room(**room.dict())
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return db_room


def update_room(db: Session, room_id: int, room_data: schemas.RoomUpdate):
    db_room = db.query(Room).filter(Room.id == room_id).first()
    if db_room:
        for key, value in room_data.dict(exclude_unset=True).items():
            setattr(db_room, key, value)
        db.commit()
        db.refresh(db_room)
    return db_room


def delete_room(db: Session, room_id: int):
    db_room = db.query(Room).filter(Room.id == room_id).first()
    if db_room:
        db.delete(db_room)
        db.commit()
    return db_room
