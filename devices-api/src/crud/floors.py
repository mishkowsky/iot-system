from sqlalchemy.orm import Session
from src.dao.models import Floor
from src.routers import schemas


def get_floors(db: Session):
    return db.query(Floor).order_by(Floor.name).all()


def create_floor(db: Session, floor: schemas.FloorCreate):
    db_floor = Floor(**floor.dict())
    db.add(db_floor)
    db.commit()
    db.refresh(db_floor)
    return db_floor

