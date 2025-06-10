from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.dao.database import get_db
from src.routers import schemas
from src.crud import floors

router = APIRouter()


@router.get("/", response_model=list[schemas.Floor])
def list_floors(db: Session = Depends(get_db)):
    return floors.get_floors(db)


@router.post("/", response_model=schemas.Floor)
def create_floor(floor: schemas.FloorCreate, db: Session = Depends(get_db)):
    return floors.create_floor(db, floor)


# @router.put("/{floor_id}", response_model=schemas.Floor)
# def update_floor(floor_id: int, floor: schemas.FloorUpdate, db: Session = Depends(get_db)):
#     return floors.update_floor(db, floor_id, floor)
#
#
# @router.delete("/{floor_id}")
# def delete_floor(floor_id: int, db: Session = Depends(get_db)):
#     return floors.delete_floor(db, floor_id)
