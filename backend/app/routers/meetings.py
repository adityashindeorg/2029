from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.meeting import Meeting
from app.models.relationship import Relationship
from app.models.user import User
from app.schemas.meeting import MeetingCreate, MeetingUpdate, MeetingToggle, MeetingResponse
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/meetings", tags=["meetings"])

def get_rel_id(db: Session) -> str:
    rel = db.query(Relationship).first()
    return rel.id if rel else "default_relationship"

@router.get("", response_model=List[MeetingResponse])
def list_meetings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    meetings = db.query(Meeting).order_by(Meeting.date.asc()).all()
    return meetings

@router.post("", response_model=MeetingResponse)
def create_meeting(
    meeting_in: MeetingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rel_id = get_rel_id(db)
    new_meeting = Meeting(
        relationship_id=rel_id,
        title=meeting_in.title,
        date=meeting_in.date,
        time=meeting_in.time or "",
        location=meeting_in.location or "",
        notes=meeting_in.notes or "",
        completed=False,
        created_by=current_user.id,
    )
    db.add(new_meeting)
    db.commit()
    db.refresh(new_meeting)
    return new_meeting

@router.put("/{meeting_id}", response_model=MeetingResponse)
def update_meeting(
    meeting_id: str,
    meeting_in: MeetingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    if meeting_in.title is not None:
        meeting.title = meeting_in.title
    if meeting_in.date is not None:
        meeting.date = meeting_in.date
    if meeting_in.time is not None:
        meeting.time = meeting_in.time
    if meeting_in.location is not None:
        meeting.location = meeting_in.location
    if meeting_in.notes is not None:
        meeting.notes = meeting_in.notes
    if meeting_in.completed is not None:
        meeting.completed = meeting_in.completed

    db.commit()
    db.refresh(meeting)
    return meeting

@router.patch("/{meeting_id}/completed", response_model=MeetingResponse)
def toggle_meeting_completed(
    meeting_id: str,
    toggle_in: MeetingToggle,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    meeting.completed = toggle_in.completed
    db.commit()
    db.refresh(meeting)
    return meeting

@router.delete("/{meeting_id}")
def delete_meeting(
    meeting_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    db.delete(meeting)
    db.commit()
    return {"status": "success", "message": "Meeting deleted"}
