from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.milestone import Milestone
from app.models.relationship import Relationship
from app.models.user import User
from app.schemas.milestone import MilestoneCreate, MilestoneUpdate, MilestoneResponse
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/milestones", tags=["milestones"])

def get_rel_id(db: Session) -> str:
    rel = db.query(Relationship).first()
    return rel.id if rel else "default_relationship"

@router.get("", response_model=List[MilestoneResponse])
def list_milestones(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    milestones = db.query(Milestone).order_by(Milestone.date.asc()).all()
    return milestones

@router.post("", response_model=MilestoneResponse)
def create_milestone(
    milestone_in: MilestoneCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rel_id = get_rel_id(db)
    new_milestone = Milestone(
        relationship_id=rel_id,
        title=milestone_in.title,
        description=milestone_in.description or "",
        date=milestone_in.date,
        created_by=current_user.id,
    )
    db.add(new_milestone)
    db.commit()
    db.refresh(new_milestone)
    return new_milestone

@router.put("/{milestone_id}", response_model=MilestoneResponse)
def update_milestone(
    milestone_id: str,
    milestone_in: MilestoneUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    
    if milestone_in.title is not None:
        milestone.title = milestone_in.title
    if milestone_in.description is not None:
        milestone.description = milestone_in.description
    if milestone_in.date is not None:
        milestone.date = milestone_in.date

    db.commit()
    db.refresh(milestone)
    return milestone

@router.delete("/{milestone_id}")
def delete_milestone(
    milestone_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not milestone:
        raise HTTPException(status_code=404, detail="Milestone not found")
    
    db.delete(milestone)
    db.commit()
    return {"status": "success", "message": "Milestone deleted"}
