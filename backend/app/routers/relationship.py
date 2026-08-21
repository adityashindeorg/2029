from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.relationship import Relationship
from app.models.user import User
from app.schemas.relationship import RelationshipUpdate, RelationshipResponse
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/relationship", tags=["relationship"])

def get_or_create_default_relationship(db: Session) -> Relationship:
    rel = db.query(Relationship).first()
    if not rel:
        rel = Relationship(
            id="default_relationship",
            partner1_name="Partner 1",
            partner2_name="Partner 2",
            start_date="2020-01-01",
            marriage_date="2029-01-01",
        )
        db.add(rel)
        db.commit()
        db.refresh(rel)
    return rel

@router.get("", response_model=RelationshipResponse)
def get_relationship(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rel = get_or_create_default_relationship(db)
    return rel

@router.put("", response_model=RelationshipResponse)
def update_relationship(
    updates: RelationshipUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rel = get_or_create_default_relationship(db)
    if updates.partner1Name is not None:
        rel.partner1_name = updates.partner1Name
    if updates.partner2Name is not None:
        rel.partner2_name = updates.partner2Name
    if updates.startDate is not None:
        rel.start_date = updates.startDate
    if updates.marriageDate is not None:
        rel.marriage_date = updates.marriageDate

    db.commit()
    db.refresh(rel)
    return rel
