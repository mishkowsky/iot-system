import os
import socket

import psutil
from fastapi import APIRouter
from fastapi import Response
from prometheus_client import Counter, Gauge
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST


REQUESTS = Counter('requests_total', 'Total number of requests sent to the controller', ['hostname'])

CPU_USAGE = Gauge('service_cpu_usage_percent', 'CPU usage in percent', ['hostname'])
MEM_USAGE = Gauge('service_mem_usage', 'RAM usage in MB', ['hostname'])
MEM_USAGE_PERCENT = Gauge('service_mem_usage_percent', 'RAM usage in percent', ['hostname'])

router = APIRouter()
process = psutil.Process(os.getpid())

# Initial CPU percent measurement (first call sets up internal stats)
process.cpu_percent(interval=None)


@router.get("/metrics")
def metrics():
    hostname = socket.gethostname()
    cpu_usage = process.cpu_percent(interval=None)
    CPU_USAGE.labels(hostname=hostname).set(cpu_usage)

    memory_used = process.memory_info().rss / (1024**2)
    memory_used_percent = process.memory_percent()

    MEM_USAGE.labels(hostname=hostname).set(memory_used)
    MEM_USAGE_PERCENT.labels(hostname=hostname).set(memory_used_percent)
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)


