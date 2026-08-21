import logging
from app.database import engine, Base, SessionLocal
from app.models.user import User
from app.models.relationship import Relationship
from app.models.milestone import Milestone
from app.models.diary import DiaryEntry
from app.models.meeting import Meeting
from app.models.plan import Plan
from app.config import settings

logger = logging.getLogger(__name__)

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Seed User 1 - Aditya
        user1 = db.query(User).filter(User.email == settings.APPROVED_USER_1_EMAIL.lower().strip()).first()
        if not user1:
            user1 = User(
                id="user-partner-1",
                name=settings.APPROVED_USER_1_NAME,
                email=settings.APPROVED_USER_1_EMAIL.lower().strip(),
                totp_secret=settings.APPROVED_USER_1_TOTP_SECRET,
            )
            db.add(user1)
            logger.info(f"Seeded User 1: {settings.APPROVED_USER_1_NAME}")
        else:
            user1.name = settings.APPROVED_USER_1_NAME
            user1.totp_secret = settings.APPROVED_USER_1_TOTP_SECRET

        # Seed User 2 - Janhvi
        user2 = db.query(User).filter(User.email == settings.APPROVED_USER_2_EMAIL.lower().strip()).first()
        if not user2:
            user2 = User(
                id="user-partner-2",
                name=settings.APPROVED_USER_2_NAME,
                email=settings.APPROVED_USER_2_EMAIL.lower().strip(),
                totp_secret=settings.APPROVED_USER_2_TOTP_SECRET,
            )
            db.add(user2)
            logger.info(f"Seeded User 2: {settings.APPROVED_USER_2_NAME}")
        else:
            user2.name = settings.APPROVED_USER_2_NAME
            user2.totp_secret = settings.APPROVED_USER_2_TOTP_SECRET

        db.commit()

        # Seed Relationship document
        rel = db.query(Relationship).first()
        if not rel:
            rel = Relationship(
                id="default_relationship",
                partner1_id=user1.id if user1 else None,
                partner2_id=user2.id if user2 else None,
                partner1_name=settings.APPROVED_USER_1_NAME,
                partner2_name=settings.APPROVED_USER_2_NAME,
                start_date=settings.DEFAULT_START_DATE,
                marriage_date=settings.DEFAULT_MARRIAGE_DATE,
            )
            db.add(rel)
            db.commit()
            logger.info("Seeded initial relationship document for Aditya & Janhvi.")
        else:
            rel.partner1_name = settings.APPROVED_USER_1_NAME
            rel.partner2_name = settings.APPROVED_USER_2_NAME
            rel.start_date = settings.DEFAULT_START_DATE
            rel.marriage_date = settings.DEFAULT_MARRIAGE_DATE
            db.commit()

        # Seed Milestones (Childhood -> 2029 Story)
        if db.query(Milestone).count() == 0:
            story_milestones = [
                Milestone(
                    id="m-2010-childhood",
                    relationship_id="default_relationship",
                    title="First Met as Children (The Parrot Drawing)",
                    description="Back in 2010 when we first met as kids. Adi drew a parrot on paper for Janhvi — the little memory where our world began.",
                    date="2010-06-15",
                    created_by="Aditya",
                ),
                Milestone(
                    id="m-2020-proposal",
                    relationship_id="default_relationship",
                    title="Adi Proposed to Janhvi (Official Start)",
                    description="April 28, 2020. The unforgettable day Adi proposed and our romantic journey officially began. Together forever since this moment.",
                    date="2020-04-28",
                    created_by="Aditya",
                ),
                Milestone(
                    id="m-2022-college",
                    relationship_id="default_relationship",
                    title="College Days Together (2020 - 2022)",
                    description="Studied together in the same college, creating endless memories, sharing canteen laughter, and growing closer every single day.",
                    date="2022-05-30",
                    created_by="Janhvi",
                ),
                Milestone(
                    id="m-2026-graduation",
                    relationship_id="default_relationship",
                    title="Completed Graduation Together",
                    description="Successfully completed our graduation till 2026, holding hands and supporting each other through every exam, project, and milestone.",
                    date="2026-06-20",
                    created_by="Aditya",
                ),
                Milestone(
                    id="m-2026-career",
                    relationship_id="default_relationship",
                    title="Stepping into Our Careers & Jobs",
                    description="Present day: Working in our jobs, building financial independence, and laying the foundation for our upcoming family life.",
                    date="2026-08-01",
                    created_by="Janhvi",
                ),
                Milestone(
                    id="m-2029-marriage",
                    relationship_id="default_relationship",
                    title="Our Wedding — 2029",
                    description="The destination we are walking towards: Getting married in 2029 and making a lifetime vow of eternal love and companionship.",
                    date="2029-12-31",
                    created_by="Aditya",
                ),
            ]
            for m in story_milestones:
                db.add(m)
            db.commit()
            logger.info("Seeded 6 lifetime milestones for Aditya & Janhvi.")

        # Seed Diary Entries
        if db.query(DiaryEntry).count() == 0:
            story_diaries = [
                DiaryEntry(
                    id="d-1",
                    relationship_id="default_relationship",
                    title="That Drawing of a Parrot in 2010",
                    content="Thinking back to 2010... who could have guessed that a childhood drawing of a parrot would turn into the greatest love of my life? From sharing pencils as kids to sharing our dreams for 2029.",
                    date="2020-04-28",
                    created_by="Aditya",
                ),
                DiaryEntry(
                    id="d-2",
                    relationship_id="default_relationship",
                    title="The Day You Said Yes (28 April 2020)",
                    content="April 28, 2020. The easiest and most certain choice I've ever made. The day we promised each other that distance, college, exams, jobs, and time would only bring us closer.",
                    date="2020-04-28",
                    created_by="Janhvi",
                ),
                DiaryEntry(
                    id="d-3",
                    relationship_id="default_relationship",
                    title="Graduation and Growing Up Together",
                    content="From college benches to stepping into corporate life and professional careers. Everything changes around us, but when I look at you, it still feels like home.",
                    date="2026-06-20",
                    created_by="Aditya",
                ),
            ]
            for d in story_diaries:
                db.add(d)
            db.commit()
            logger.info("Seeded diary entries.")

        # Seed Meetings
        if db.query(Meeting).count() == 0:
            m1 = Meeting(
                id="mtg-1",
                relationship_id="default_relationship",
                title="Weekend Evening Celebration",
                date="2026-08-30",
                time="19:30",
                location="Skyline Rooftop Garden",
                notes="Dinner date to celebrate our journey and discuss our 2029 wedding roadmap.",
                completed=False,
                created_by="Aditya",
            )
            db.add(m1)
            db.commit()

        # Seed Future Plans
        if db.query(Plan).count() == 0:
            p1 = Plan(
                id="plan-1",
                relationship_id="default_relationship",
                title="Our Dream Wedding in 2029",
                date="2029-12-31",
                description="The ultimate celebration where Aditya and Janhvi tie the knot surrounded by loved ones.",
                completed=False,
                created_by="Aditya",
            )
            p2 = Plan(
                id="plan-2",
                relationship_id="default_relationship",
                title="First International Vacation Together",
                date="2027-05-15",
                description="Explore Switzerland and Italy together as a pre-marriage honeymoon trip.",
                completed=False,
                created_by="Janhvi",
            )
            db.add(p1)
            db.add(p2)
            db.commit()

    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
