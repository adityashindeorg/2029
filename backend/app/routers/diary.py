from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.diary import DiaryEntry
from app.models.relationship import Relationship
from app.models.user import User
from app.schemas.diary import DiaryCreate, DiaryUpdate, DiaryResponse
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/diary", tags=["diary"])

def get_rel_id(db: Session) -> str:
    rel = db.query(Relationship).first()
    return rel.id if rel else "default_relationship"

@router.get("", response_model=List[DiaryResponse])
def list_diary_entries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entries = db.query(DiaryEntry).order_by(DiaryEntry.date.desc()).all()
    return entries

@router.post("", response_model=DiaryResponse)
def create_diary_entry(
    entry_in: DiaryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rel_id = get_rel_id(db)
    new_entry = DiaryEntry(
        relationship_id=rel_id,
        title=entry_in.title,
        content=entry_in.content,
        date=entry_in.date,
        created_by=current_user.id,
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return new_entry

@router.put("/{entry_id}", response_model=DiaryResponse)
def update_diary_entry(
    entry_id: str,
    entry_in: DiaryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = db.query(DiaryEntry).filter(DiaryEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Diary entry not found")
    
    if entry_in.title is not None:
        entry.title = entry_in.title
    if entry_in.content is not None:
        entry.content = entry_in.content
    if entry_in.date is not None:
        entry.date = entry_in.date

    db.commit()
    db.refresh(entry)
    return entry

@router.delete("/{entry_id}")
def delete_diary_entry(
    entry_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = db.query(DiaryEntry).filter(DiaryEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Diary entry not found")
    
    db.delete(entry)
    db.commit()
    return {"status": "success", "message": "Diary entry deleted"}
