import socket
import os
import psutil
from dotenv import load_dotenv
from fastapi import APIRouter
from fastapi import FastAPI
from fastapi import Response
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import Counter, Gauge
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST

from src.config import CONFIG

REQUESTS = Counter('requests_total', 'Total number of requests sent to the controller', ['hostname'])

CPU_USAGE = Gauge('service_cpu_usage_percent', 'CPU usage in percent', ['hostname'])
MEM_USAGE = Gauge('service_mem_usage_percent', 'RAM usage in percent', ['hostname'])

router = APIRouter()

process = psutil.Process(os.getpid())

# Initial CPU percent measurement (first call sets up internal stats)
process.cpu_percent(interval=None)


@router.get("/metrics")
def metrics():
    hostname = socket.gethostname()
    load1, _, _ = psutil.getloadavg()
    cpu_usage = process.cpu_percent(interval=None)
    CPU_USAGE.labels(hostname=hostname).set(cpu_usage)
    MEM_USAGE.labels(hostname=hostname).set(psutil.virtual_memory()[2])
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)


load_dotenv()

app = FastAPI(title=CONFIG.APP_NAME)

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, tags=[""])
