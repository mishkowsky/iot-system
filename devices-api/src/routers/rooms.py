from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.dao.database import get_db
from src.routers import schemas
from src.crud import rooms

router = APIRouter()


@router.get("/", response_model=list[schemas.Room])
def list_rooms_by_floor(floor_id: int, db: Session = Depends(get_db)):
    room_s = rooms.get_rooms(db, floor_id)
    return room_s


@router.get("/{room_id}/", response_model=schemas.Room)
def get_room_by_id(room_id: int, db: Session = Depends(get_db)):
    return rooms.get_room(db, room_id)


@router.post("/", response_model=schemas.Room)
def create_room(room: schemas.RoomCreate, db: Session = Depends(get_db)):
    return rooms.create_room(db, room)


@router.put("/{room_id}", response_model=schemas.Room)
def update_room(room_id: int, room: schemas.RoomUpdate, db: Session = Depends(get_db)):
    return rooms.update_room(db, room_id, room)


@router.delete("/{room_id}")
def delete_room(room_id: int, db: Session = Depends(get_db)):
    return rooms.delete_room(db, room_id)
