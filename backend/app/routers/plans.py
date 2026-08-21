from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.plan import Plan
from app.models.relationship import Relationship
from app.models.user import User
from app.schemas.plan import PlanCreate, PlanUpdate, PlanToggle, PlanResponse
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/api/plans", tags=["plans"])

def get_rel_id(db: Session) -> str:
    rel = db.query(Relationship).first()
    return rel.id if rel else "default_relationship"

@router.get("", response_model=List[PlanResponse])
def list_plans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plans = db.query(Plan).order_by(Plan.date.asc()).all()
    return plans

@router.post("", response_model=PlanResponse)
def create_plan(
    plan_in: PlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rel_id = get_rel_id(db)
    new_plan = Plan(
        relationship_id=rel_id,
        title=plan_in.title,
        description=plan_in.description or "",
        date=plan_in.date,
        completed=False,
        created_by=current_user.id,
    )
    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)
    return new_plan

@router.put("/{plan_id}", response_model=PlanResponse)
def update_plan(
    plan_id: str,
    plan_in: PlanUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plan = db.query(Plan).filter(Plan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    if plan_in.title is not None:
        plan.title = plan_in.title
    if plan_in.description is not None:
        plan.description = plan_in.description
    if plan_in.date is not None:
        plan.date = plan_in.date
    if plan_in.completed is not None:
        plan.completed = plan_in.completed

    db.commit()
    db.refresh(plan)
    return plan

@router.patch("/{plan_id}/completed", response_model=PlanResponse)
def toggle_plan_completed(
    plan_id: str,
    toggle_in: PlanToggle,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plan = db.query(Plan).filter(Plan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    plan.completed = toggle_in.completed
    db.commit()
    db.refresh(plan)
    return plan

@router.delete("/{plan_id}")
def delete_plan(
    plan_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plan = db.query(Plan).filter(Plan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    db.delete(plan)
    db.commit()
    return {"status": "success", "message": "Plan deleted"}
