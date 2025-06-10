import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
from src.routers import floors, rooms, devices, prometheues
from src.dao.database import Base, engine
from dotenv import load_dotenv

load_dotenv()

from src.config import CONFIG
Base.metadata.create_all(bind=engine)

app = FastAPI(title=CONFIG.APP_NAME)

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(floors.router, prefix="/api/floors", tags=["Floors"])
app.include_router(rooms.router, prefix="/api/rooms", tags=["Rooms"])
app.include_router(devices.router, prefix="/api/devices", tags=["Devices"])
app.include_router(prometheues.router, tags=["Prometheus metrics"])

if __name__ == '__main__':
    logger.add(f"logs/logs.txt", serialize=True)
    logger.info('DEVICES API STARTED')
    uvicorn.run(app, port=CONFIG.APP_PORT, host=CONFIG.APP_HOST)
