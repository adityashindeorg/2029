import React, { useState } from 'react';
import { useRelationship } from '../../hooks/useRelationship';
import { useAuth } from '../../hooks/useAuth';
import { createPlan, updatePlan } from '../../services/planService';
import { Plan } from '../../types/plan';

interface PlanFormProps {
  planToEdit?: Plan | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const PlanForm: React.FC<PlanFormProps> = ({
  planToEdit,
  onSuccess,
  onCancel,
}) => {
  const { relationship } = useRelationship();
  const { user } = useAuth();

  const [title, setTitle] = useState(planToEdit?.title || '');
  const [description, setDescription] = useState(planToEdit?.description || '');
  const [date, setDate] = useState(planToEdit?.date || '2029-12-31');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be signed in to save a plan.');
      return;
    }

    if (!title.trim() || !date) {
      setError('Title and target date are required.');
      return;
    }

    const relationshipId = relationship?.id || 'default_relationship';

    setLoading(true);
    setError(null);

    try {
      if (planToEdit) {
        await updatePlan(relationshipId, planToEdit.id, {
          title: title.trim(),
          description: description.trim(),
          date,
        });
      } else {
        await createPlan(relationshipId, title.trim(), description.trim(), date);
      }
      onSuccess();
    } catch (err: unknown) {
      console.error('Plan save error:', err);
      const message = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
      setError(`Save Failed: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="sheet-backdrop show" onClick={onCancel} />
      <div className="sheet show">
        <div className="sheet-grab" />
        <div className="sheet-head">
          <span className="eyebrow">{planToEdit ? 'Edit Plan' : 'New Future Dream'}</span>
          <button type="button" className="icon-btn" onClick={onCancel}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="sheet-body">
          {error && (
            <div style={{ color: '#ff8f9c', background: 'rgba(179,18,45,0.18)', borderRadius: '12px', padding: '10px', fontSize: '13px', marginBottom: '12px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="field">
              <label>Target Date / Year</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="field">
              <label>Plan Title</label>
              <input
                type="text"
                placeholder="e.g. Travel to Switzerland, Buy our cozy home"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="field">
              <label>Description (Optional)</label>
              <textarea
                placeholder="Details of our future dream..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              style={{ marginTop: '10px' }}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Plan'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
