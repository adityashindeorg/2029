import React, { useEffect, useState } from 'react';
import { useRelationship } from '../../hooks/useRelationship';
import { getPlans, togglePlanCompleted, deletePlan } from '../../services/planService';
import { Plan } from '../../types/plan';
import { PlanForm } from './PlanForm';

export const PlanList: React.FC = () => {
  const { relationship } = useRelationship();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const loadPlans = async () => {
    if (!relationship) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getPlans(relationship.id);
      setPlans(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load future plans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (relationship) {
      loadPlans();
    } else {
      setLoading(false);
    }
  }, [relationship]);

  // Listen to FAB click event
  useEffect(() => {
    const handleFabOpen = () => setShowAddForm(true);
    window.addEventListener('open-plan-editor', handleFabOpen);
    return () => window.removeEventListener('open-plan-editor', handleFabOpen);
  }, []);

  const handleToggleCompleted = async (plan: Plan) => {
    if (!relationship) return;
    try {
      await togglePlanCompleted(relationship.id, plan.id, !plan.completed);
      setPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? { ...p, completed: !p.completed } : p))
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update plan status.');
    }
  };

  const handleDelete = async (planId: string) => {
    if (!relationship) return;
    if (!window.confirm('Are you sure you want to delete this plan?')) return;

    try {
      await deletePlan(relationship.id, planId);
      setPlans((prev) => prev.filter((p) => p.id !== planId));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete plan.');
    }
  };

  return (
    <div>
      {/* Top App Bar */}
      <div className="app-topbar">
        <div>
          <div className="greeting" style={{ fontSize: '24px' }}>Plans</div>
          <p style={{ fontSize: '13px', color: 'var(--gray)', marginTop: '4px', fontStyle: 'italic', fontFamily: 'var(--serif)' }}>
            Dreams we are building towards.
          </p>
        </div>
        <button className="icon-btn" onClick={() => setShowAddForm(true)} title="Add Plan">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      <div className="sec-head">
        <span className="eyebrow">Future Plans &amp; Dreams</span>
      </div>

      {error && (
        <div style={{ margin: '10px 22px', color: '#ff8f9c', background: 'rgba(179,18,45,0.18)', borderRadius: '12px', padding: '12px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--gray)' }}>
          <p className="onb-tagline">Loading future plans...</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="empty-state">
          <div className="glyph">
            <span className="ui-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </span>
          </div>
          <div className="h">No plans added yet.</div>
          <div className="s">Create your first dream or travel goal for 2029.</div>
          <button className="btn btn-primary" onClick={() => setShowAddForm(true)} style={{ margin: '0 auto' }}>
            Add Future Plan
          </button>
        </div>
      ) : (
        plans.map((plan) => (
          <div
            key={plan.id}
            className="plan-card"
            style={{
              opacity: plan.completed ? 0.65 : 1,
            }}
          >
            <div className="row1">
              <span className={`badge ${plan.completed ? 'badge-completed' : 'badge-gold'}`}>
                {plan.completed ? '✓ Achieved' : 'Target Goal'}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--gray-dim)', fontWeight: 700 }}>
                Target: {plan.date}
              </span>
            </div>
            <div
              className="title"
              style={{
                textDecoration: plan.completed ? 'line-through' : 'none',
              }}
            >
              {plan.title}
            </div>
            {plan.description && <div className="description">{plan.description}</div>}

            <div className="meta" style={{ marginTop: '12px', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', textTransform: 'none', color: 'var(--ivory-dim)' }}>
                <input
                  type="checkbox"
                  checked={plan.completed}
                  onChange={() => handleToggleCompleted(plan)}
                  style={{ accentColor: 'var(--crimson-bright)' }}
                />
                {plan.completed ? 'Achieved' : 'Mark as done'}
              </label>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-text"
                  style={{ fontSize: '12px', padding: '4px 8px' }}
                  onClick={() => setEditingPlan(plan)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn-text"
                  style={{ fontSize: '12px', padding: '4px 8px', color: '#ff8f9c' }}
                  onClick={() => handleDelete(plan.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Modal Form */}
      {(showAddForm || editingPlan) && (
        <PlanForm
          planToEdit={editingPlan}
          onSuccess={() => {
            setShowAddForm(false);
            setEditingPlan(null);
            loadPlans();
          }}
          onCancel={() => {
            setShowAddForm(false);
            setEditingPlan(null);
          }}
        />
      )}

      <div style={{ height: '30px' }} />
    </div>
  );
};
