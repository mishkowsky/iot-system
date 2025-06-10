import os
from dotenv import load_dotenv

load_dotenv()

API_URL = os.getenv("API_SERVER_BASE_URL", "http://localhost:8000")
