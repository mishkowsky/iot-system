from datetime import datetime
from typing import Union, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.dao.database import get_db
from src.routers import schemas
from src.crud import devices, rooms

router = APIRouter()


# @router.get("/", response_model=list[schemas.Device])
# def list_devices(db: Session = Depends(get_db)):
#     return devices.get_devices(db)


@router.get("/unassigned", response_model=list[Union[schemas.Bulb, schemas.Sensor]])
def list_unassigned_devices(db: Session = Depends(get_db)):
    return devices.get_unassigned_devices(db)


@router.get("/", response_model=list[Union[schemas.Bulb, schemas.Sensor]])
def list_devices(room_id: int = None, db: Session = Depends(get_db)):
    return devices.get_devices(db, room_id)


@router.post("/", response_model=Union[schemas.Bulb, schemas.Sensor])
def create_device(device: schemas.DeviceCreate, db: Session = Depends(get_db)):
    return devices.create_device(db, device)


@router.get("/{device_id}/room", response_model=Optional[schemas.Room])
def get_related_room_by_device_id(device_id: int, db: Session = Depends(get_db)):
    return rooms.get_room_by_device_id(db, device_id)


@router.get("/{device_id}", response_model=Union[schemas.Bulb, schemas.Sensor])
def get_device(device_id: int, db: Session = Depends(get_db)):
    return devices.get_device_by_id(db, device_id)


@router.put("/{device_id}", response_model=schemas.Bulb)
def update_device(device_id: int, device: schemas.BulbUpdate, db: Session = Depends(get_db)):
    updated_device = devices.update_device(db, device_id, device)
    return updated_device


@router.delete("/{device_id}")
def delete_device(device_id: int, db: Session = Depends(get_db)):
    return devices.delete_device(db, device_id)


@router.put("/{device_id}/assign")
def assign_device_to_room(device_id: int, room_id: int, db: Session = Depends(get_db)):
    return devices.assign_device_to_room(db, device_id, room_id)


@router.put("/{device_id}/unassign")
def unassign_device(device_id: int, db: Session = Depends(get_db)):
    return devices.unassign_device(db, device_id)

# @router.post("/{device_id}/metrics")
# def create_device_metric(device_id: int, metric: schemas.DeviceMetricsCreate, db: Session = Depends(get_metrics_db)):
#     return metrics.create_metrics_entry(db, device_id, metric)
#
#
# @router.get("/{device_id}/metrics")
# def get_device_metrics(device_id: int,
#                       start_time: datetime | None = None, end_time: datetime | None = None,
#                       db: Session = Depends(get_metrics_db)):
#     return metrics.get_device_metrics(db, device_id, start_time, end_time)
