
def test_get_floors(client):
    response = client.get("/api/floors")
    assert response.status_code == 200
    assert len(response.json()) == 1
