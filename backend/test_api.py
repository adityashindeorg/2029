import os
import sys
import pyotp

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Use SQLite in-memory / temporary DB for running the test suite
test_db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "test_2029.db")
if os.path.exists(test_db_path):
    os.remove(test_db_path)
os.environ["DATABASE_URL"] = f"sqlite:///{test_db_path}"

from fastapi.testclient import TestClient
from app.main import app
from app.seed import seed_database
from app.config import settings

def test_full_flow():
    # 1. Startup & Seed
    seed_database()
    client = TestClient(app)

    # 2. Health check
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("✓ Health check passed")

    # 3. TOTP Auth login with partner 1
    # Generate live TOTP code for Partner 1
    valid_code = pyotp.TOTP(settings.APPROVED_USER_1_TOTP_SECRET).now()
    
    # Test invalid code first
    invalid_login = client.post("/api/auth/login", json={
        "identifier": "partner1@2029.app",
        "code": "000000"
    })
    # If 000000 happens to be valid by 1 in 1,000,000 chance, handle it
    if valid_code != "000000":
        assert invalid_login.status_code == 401
        print("✓ Invalid TOTP rejection passed")

    # Test valid TOTP code
    login_res = client.post("/api/auth/login", json={
        "identifier": "partner1@2029.app",
        "code": valid_code
    })
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token_data = login_res.json()
    token = token_data["access_token"]
    user = token_data["user"]
    assert user["email"] == "partner1@2029.app"
    print("✓ TOTP Auth login passed")

    headers = {"Authorization": f"Bearer {token}"}

    # 4. Auth Me
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200, f"Auth Me failed: {me_res.text}"
    assert me_res.json()["id"] == user["id"]
    print("✓ Auth /me passed")

    # 5. Relationship GET & PUT
    rel_res = client.get("/api/relationship", headers=headers)
    assert rel_res.status_code == 200, f"Get relationship failed: {rel_res.text}"
    rel = rel_res.json()
    assert rel["partner1Name"] == "Partner 1"

    update_rel_res = client.put("/api/relationship", json={
        "partner1Name": "Alice",
        "partner2Name": "Bob",
        "startDate": "2021-05-15",
        "marriageDate": "2029-06-20"
    }, headers=headers)
    assert update_rel_res.status_code == 200
    assert update_rel_res.json()["partner1Name"] == "Alice"
    print("✓ Relationship GET & PUT passed")

    # 6. Diary CRUD
    create_diary_res = client.post("/api/diary", json={
        "title": "First date memory",
        "content": "We had coffee and walked through the park together.",
        "date": "2021-05-15"
    }, headers=headers)
    assert create_diary_res.status_code == 200, f"Create diary failed: {create_diary_res.text}"
    diary_entry = create_diary_res.json()
    assert diary_entry["title"] == "First date memory"
    diary_id = diary_entry["id"]

    list_diary_res = client.get("/api/diary", headers=headers)
    assert list_diary_res.status_code == 200
    assert len(list_diary_res.json()) >= 1

    update_diary_res = client.put(f"/api/diary/{diary_id}", json={
        "title": "First date memory (Updated)",
        "content": "We had coffee and gelato in the park.",
        "date": "2021-05-15"
    }, headers=headers)
    assert update_diary_res.status_code == 200
    assert update_diary_res.json()["title"] == "First date memory (Updated)"

    del_diary_res = client.delete(f"/api/diary/{diary_id}", headers=headers)
    assert del_diary_res.status_code == 200
    print("✓ Diary CRUD passed")

    # 7. Milestone CRUD
    create_ms_res = client.post("/api/milestones", json={
        "title": "Moved in together",
        "description": "Got our first apartment keys!",
        "date": "2022-09-01"
    }, headers=headers)
    assert create_ms_res.status_code == 200
    ms = create_ms_res.json()
    ms_id = ms["id"]

    list_ms_res = client.get("/api/milestones", headers=headers)
    assert list_ms_res.status_code == 200
    assert len(list_ms_res.json()) >= 1

    update_ms_res = client.put(f"/api/milestones/{ms_id}", json={
        "title": "Moved in together!",
        "description": "Got our first cozy apartment.",
        "date": "2022-09-01"
    }, headers=headers)
    assert update_ms_res.status_code == 200

    del_ms_res = client.delete(f"/api/milestones/{ms_id}", headers=headers)
    assert del_ms_res.status_code == 200
    print("✓ Milestones CRUD passed")

    # 8. Meeting CRUD
    create_meeting_res = client.post("/api/meetings", json={
        "title": "Dinner at sunset",
        "date": "2026-09-01",
        "time": "19:00",
        "location": "Rooftop Bistro",
        "notes": "Table reserved by the window."
    }, headers=headers)
    assert create_meeting_res.status_code == 200
    meeting = create_meeting_res.json()
    meeting_id = meeting["id"]
    assert meeting["completed"] is False

    patch_meeting_res = client.patch(f"/api/meetings/{meeting_id}/completed", json={
        "completed": True
    }, headers=headers)
    assert patch_meeting_res.status_code == 200
    assert patch_meeting_res.json()["completed"] is True

    del_meeting_res = client.delete(f"/api/meetings/{meeting_id}", headers=headers)
    assert del_meeting_res.status_code == 200
    print("✓ Meetings CRUD & toggle passed")

    # 9. Plan CRUD
    create_plan_res = client.post("/api/plans", json={
        "title": "Trip to Kyoto",
        "description": "Visit temples and experience tea ceremony.",
        "date": "2027-04-10"
    }, headers=headers)
    assert create_plan_res.status_code == 200
    plan = create_plan_res.json()
    plan_id = plan["id"]

    patch_plan_res = client.patch(f"/api/plans/{plan_id}/completed", json={
        "completed": True
    }, headers=headers)
    assert patch_plan_res.status_code == 200
    assert patch_plan_res.json()["completed"] is True

    del_plan_res = client.delete(f"/api/plans/{plan_id}", headers=headers)
    assert del_plan_res.status_code == 200
    print("✓ Plans CRUD & toggle passed")

    print("\n🎉 ALL TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_full_flow()
