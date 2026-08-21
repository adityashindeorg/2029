import React, { useState } from 'react';
import { useRelationship } from '../../hooks/useRelationship';
import { useAuth } from '../../hooks/useAuth';
import { createMilestone, updateMilestone } from '../../services/milestoneService';
import { Milestone } from '../../types/milestone';

interface MilestoneFormProps {
  milestoneToEdit?: Milestone | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const MilestoneForm: React.FC<MilestoneFormProps> = ({
  milestoneToEdit,
  onSuccess,
  onCancel,
}) => {
  const { relationship } = useRelationship();
  const { user } = useAuth();

  const todayStr = new Date().toISOString().split('T')[0];
  const [title, setTitle] = useState(milestoneToEdit?.title || '');
  const [description, setDescription] = useState(milestoneToEdit?.description || '');
  const [date, setDate] = useState(milestoneToEdit?.date || todayStr);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be signed in to save a milestone.');
      return;
    }

    if (!title.trim() || !date) {
      setError('Title and date are required.');
      return;
    }

    const relationshipId = relationship?.id || 'default_relationship';

    setLoading(true);
    setError(null);

    try {
      if (milestoneToEdit) {
        await updateMilestone(relationshipId, milestoneToEdit.id, {
          title: title.trim(),
          description: description.trim(),
          date,
        });
      } else {
        await createMilestone(relationshipId, title.trim(), description.trim(), date);
      }
      onSuccess();
    } catch (err: unknown) {
      console.error('Milestone save error:', err);
      const message = err instanceof Error ? err.message : String(err);
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
          <span className="eyebrow">{milestoneToEdit ? 'Edit Milestone' : 'New Milestone'}</span>
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
              <label>Milestone Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="field">
              <label>Milestone Title</label>
              <input
                type="text"
                placeholder="e.g. Our First Trip Together"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="field">
              <label>Description / Story</label>
              <textarea
                placeholder="Write about this cherished milestone..."
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
              {loading ? 'Saving...' : 'Save Milestone'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
