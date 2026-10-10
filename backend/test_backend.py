from fastapi.testclient import TestClient
from main import app, startup_event

client = TestClient(app)

def test_full_flow():
    startup_event()
    
    res = client.get("/api/health")
    assert res.status_code == 200

    res = client.get("/api/entries")
    assert res.status_code == 200
    entries = res.json()
    assert len(entries) >= 10

    preview_res = client.post("/api/nlp/preview", json={
        "title": "Machine Learning Research Paper",
        "content": "Deep neural networks and Latent Dirichlet Allocation models show fantastic text classification accuracy."
    })
    assert preview_res.status_code == 200

    create_res = client.post("/api/entries", json={
        "title": "New Test Entry on Computer Vision",
        "content": "Studied image segmentation algorithms and convolutional neural networks today.",
        "entry_date": "2026-10-10",
        "mood": "Motivated"
    })
    assert create_res.status_code == 201

    analytics_res = client.get("/api/analytics")
    assert analytics_res.status_code == 200

if __name__ == "__main__":
    test_full_flow()
    print("\n--- ALL BACKEND NLP & FASTAPI TESTS PASSED SUCCESSFULLY! ---")
