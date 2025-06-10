import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient




@pytest.fixture(scope="module")
def env_vars():
    os.environ["DB_URI"] = "sqlite:///./test.db"


@pytest.fixture(scope="module")
def test_db(env_vars):
    from src.dao.database import Base
    engine = create_engine("sqlite:///./test.db")
    from src.dao.models import Floor, Room, Device, Bulb
    Base.metadata.create_all(bind=engine)
    from src.dao.database import get_db
    db = next(get_db())
    floor = Floor(level=1, name='1st floor')

    db.add(floor)
    unassigned_bulb = Bulb(name="bulb")
    db.add(unassigned_bulb)
    room = Room(name="room")
    db.add(room)
    assigned_bulb = Bulb(name="bulb2", room_id=1, is_on=False)
    db.add(assigned_bulb)
    db.commit()

    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    yield TestingSessionLocal()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="module")
def client(test_db):
    from src.routers.floors import get_db
    from src.main import app, engine
    app.dependency_overrides[get_db] = lambda: test_db
    app.dependency_overrides[engine] = create_engine("sqlite:///./test.db")
    yield TestClient(app)
