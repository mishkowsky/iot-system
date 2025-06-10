def test_list_unassigned_devices(client):
    response = client.get("/api/devices/unassigned")
    assert response.status_code == 200
    assert response.json()[0]["type"] == "bulb"


def test_list_devices(client):
    response = client.get("/api/devices/?room_id=1")
    assert response.status_code == 200
    assert response.json()[0]["id"] == 2


def test_create_device(client):
    payload = {
        "name": "New Bulb",
        "type": "bulb",
        "room_id": 1
    }
    response = client.post("/api/devices/", json=payload)
    assert response.status_code == 200
    assert response.json()["type"] == "bulb"


def test_get_related_room_by_device_id(client):
    response = client.get("/api/devices/2/room")
    assert response.status_code == 200
    assert response.json()["id"] == 1


def test_get_device_by_id(client):
    response = client.get("/api/devices/1")
    assert response.status_code == 200
    assert response.json()["type"] == "bulb"


def test_update_device(client):
    update_payload = {"is_on": True}
    response = client.put("/api/devices/1", json=update_payload)
    assert response.status_code == 200
    assert response.json()["is_on"] is True


def test_delete_device(client):
    response = client.delete("/api/devices/1")
    assert response.status_code == 200


def test_assign_device_to_room(client):
    response = client.put("/api/devices/1/assign?room_id=1")
    assert response.status_code == 200


def test_unassign_device(client):
    response = client.put("/api/devices/1/unassign")
    assert response.status_code == 200
