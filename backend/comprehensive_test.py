import os
import sys
import pyotp

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Use clean SQLite for integration testing
test_db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "test_comprehensive.db")
if os.path.exists(test_db_path):
    os.remove(test_db_path)
os.environ["DATABASE_URL"] = f"sqlite:///{test_db_path}"

from fastapi.testclient import TestClient
from app.main import app
from app.seed import seed_database
from app.config import settings

def run_tests():
    print("==================================================")
    print("    RUNNING PROJECT 2029 COMPREHENSIVE TEST SUITE ")
    print("==================================================")
    
    seed_database()
    client = TestClient(app)

    # ----------------------------------------------------
    # 1. Health Check
    # ----------------------------------------------------
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    assert res.json() == {"status": "ok", "app": "2029"}
    print("✓ [1/8] API Health check passed")

    # ----------------------------------------------------
    # 2. Authentication & TOTP Validation
    # ----------------------------------------------------
    # Invalid user rejection
    inv_user = client.post("/api/auth/login", json={"identifier": "intruder@evil.com", "code": "123456"})
    assert inv_user.status_code == 401
    assert "User not found" in inv_user.json()["detail"]

    # Invalid code rejection for Partner 1
    inv_code = client.post("/api/auth/login", json={"identifier": "partner1@2029.app", "code": "000000"})
    assert inv_code.status_code == 401
    assert "Invalid 6-digit" in inv_code.json()["detail"]

    # Partner 1 login with valid TOTP
    p1_code = pyotp.TOTP(settings.APPROVED_USER_1_TOTP_SECRET).now()
    p1_login = client.post("/api/auth/login", json={"identifier": "partner1@2029.app", "code": p1_code})
    assert p1_login.status_code == 200
    p1_token = p1_login.json()["access_token"]
    p1_headers = {"Authorization": f"Bearer {p1_token}"}

    # Partner 2 login with valid TOTP
    p2_code = pyotp.TOTP(settings.APPROVED_USER_2_TOTP_SECRET).now()
    p2_login = client.post("/api/auth/login", json={"identifier": "partner2@2029.app", "code": p2_code})
    assert p2_login.status_code == 200
    p2_token = p2_login.json()["access_token"]
    p2_headers = {"Authorization": f"Bearer {p2_token}"}

    # Verify /api/auth/me
    me_res = client.get("/api/auth/me", headers=p1_headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "partner1@2029.app"

    # Verify protected route blocks unauthenticated requests
    unauth_res = client.get("/api/relationship")
    assert unauth_res.status_code == 401
    print("✓ [2/8] TOTP Authentication & Route Protection passed")

    # ----------------------------------------------------
    # 3. Relationship Metadata
    # ----------------------------------------------------
    rel_get = client.get("/api/relationship", headers=p1_headers)
    assert rel_get.status_code == 200
    assert rel_get.json()["id"] == "default_relationship"

    rel_update = client.put("/api/relationship", json={
        "partner1Name": "Aditya",
        "partner2Name": "Janhvi",
        "startDate": "2020-04-28",
        "marriageDate": "2029-12-31"
    }, headers=p1_headers)
    assert rel_update.status_code == 200
    updated_rel = rel_update.json()
    assert updated_rel["partner1Name"] == "Aditya"
    assert updated_rel["partner2Name"] == "Janhvi"
    assert updated_rel["startDate"] == "2020-04-28"
    assert updated_rel["marriageDate"] == "2029-12-31"
    print("✓ [3/8] Relationship GET & PUT passed")

    # ----------------------------------------------------
    # 4. Diary CRUD (Text-Only)
    # ----------------------------------------------------
    initial_diaries = client.get("/api/diary", headers=p1_headers).json()
    initial_count = len(initial_diaries)

    # Create entries
    e1 = client.post("/api/diary", json={
        "title": "First Meeting",
        "content": "A memorable walk in the garden under the evening sun.",
        "date": "2020-02-14"
    }, headers=p1_headers).json()

    e2 = client.post("/api/diary", json={
        "title": "Starry Night Drive",
        "content": "Drove up the hills and watched the city lights.",
        "date": "2021-08-20"
    }, headers=p2_headers).json()

    diary_list = client.get("/api/diary", headers=p1_headers).json()
    assert len(diary_list) == initial_count + 2

    # Update entry
    e1_updated = client.put(f"/api/diary/{e1['id']}", json={
        "title": "First Meeting (Cherished)",
        "content": "A memorable walk in the garden with endless conversations.",
        "date": "2020-02-14"
    }, headers=p1_headers).json()
    assert e1_updated["title"] == "First Meeting (Cherished)"

    # Delete entry
    del_res = client.delete(f"/api/diary/{e2['id']}", headers=p1_headers)
    assert del_res.status_code == 200
    assert len(client.get("/api/diary", headers=p1_headers).json()) == initial_count + 1
    print("✓ [4/8] Diary CRUD (Text-Only) passed")

    # ----------------------------------------------------
    # 5. Milestones & Timeline (Text-Only)
    # ----------------------------------------------------
    initial_m_count = len(client.get("/api/milestones", headers=p1_headers).json())
    
    m1 = client.post("/api/milestones", json={
        "title": "Special Memory 1",
        "description": "The day we promised to be together.",
        "date": "2020-02-14"
    }, headers=p1_headers).json()

    milestone_list = client.get("/api/milestones", headers=p1_headers).json()
    assert len(milestone_list) == initial_m_count + 1

    # Delete milestone
    client.delete(f"/api/milestones/{m1['id']}", headers=p1_headers)
    assert len(client.get("/api/milestones", headers=p1_headers).json()) == initial_m_count
    print("✓ [5/8] Milestones & Timeline CRUD passed")

    # ----------------------------------------------------
    # 6. Upcoming Meetings
    # ----------------------------------------------------
    mtg = client.post("/api/meetings", json={
        "title": "Weekend Dinner Date",
        "date": "2026-08-30",
        "time": "19:30",
        "location": "Skyline Lounge",
        "notes": "Table booked for two."
    }, headers=p1_headers).json()
    assert mtg["completed"] is False

    # Toggle completion
    toggled = client.patch(f"/api/meetings/{mtg['id']}/completed", json={"completed": True}, headers=p1_headers).json()
    assert toggled["completed"] is True
    print("✓ [6/8] Meetings CRUD & Completion Toggle passed")

    # ----------------------------------------------------
    # 7. Future Plans
    # ----------------------------------------------------
    p = client.post("/api/plans", json={
        "title": "Europe Holiday",
        "description": "Explore Switzerland and Italy together.",
        "date": "2028-06-01"
    }, headers=p2_headers).json()
    assert p["completed"] is False

    # Toggle plan completion
    p_toggled = client.patch(f"/api/plans/{p['id']}/completed", json={"completed": True}, headers=p2_headers).json()
    assert p_toggled["completed"] is True

    # Delete plan
    del_plan = client.delete(f"/api/plans/{p['id']}", headers=p2_headers)
    assert del_plan.status_code == 200
    print("✓ [7/8] Future Plans CRUD & Completion Toggle passed")

    # ----------------------------------------------------
    # 8. Clean Up Test Database
    # ----------------------------------------------------
    if os.path.exists(test_db_path):
        os.remove(test_db_path)
    print("✓ [8/8] Test DB cleanup passed")

    print("\n==================================================")
    print("  ALL 8 INTEGRATION TEST PHASES PASSED WITH 100% ")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
