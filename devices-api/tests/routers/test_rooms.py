

def test_create_room(client):
    response = client.post("/api/rooms/", json={"name": "Living Room", "floor_id": 1})
    assert response.status_code == 200
    assert response.json()["name"] == "Living Room"


def test_list_rooms_by_floor(client):
    # room_id = client.post("/api/rooms/", json={"name": "Living Room", "floor_id": 1}).json()["id"]
    response = client.get(f"/api/rooms/?floor_id=1")
    assert response.status_code == 200
    assert response.json()[0]["name"] == "Living Room"


def test_get_room_by_id(client):
    # room_id = client.post("/api/rooms/", json={"name": "Living Room", "floor_id": 1}).json()["id"]
    response = client.get(f"/api/rooms/1/")
    assert response.status_code == 200
    assert response.json()["id"] == 1


def test_update_room(client):
    # room_id = client.post("/api/rooms/", json={"name": "Living Room", "floor_id": 1}).json()["id"]
    response = client.put(f"/api/rooms/1", json={"name": "Updated Room"})
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Room"


def test_delete_room(client):
    # room_id = client.post("/api/rooms/", json={"name": "Living Room", "floor_id": 1}).json()["id"]
    response = client.delete(f"/api/rooms/1")
    assert response.status_code == 200
