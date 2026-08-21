import React, { useState } from 'react';
import { useRelationship } from '../../hooks/useRelationship';
import { useAuth } from '../../hooks/useAuth';
import { createMeeting, updateMeeting } from '../../services/meetingService';
import { Meeting } from '../../types/meeting';

interface MeetingFormProps {
  meetingToEdit?: Meeting | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const MeetingForm: React.FC<MeetingFormProps> = ({
  meetingToEdit,
  onSuccess,
  onCancel,
}) => {
  const { relationship } = useRelationship();
  const { user } = useAuth();

  const todayStr = new Date().toISOString().split('T')[0];
  const [title, setTitle] = useState(meetingToEdit?.title || '');
  const [date, setDate] = useState(meetingToEdit?.date || todayStr);
  const [time, setTime] = useState(meetingToEdit?.time || '');
  const [location, setLocation] = useState(meetingToEdit?.location || '');
  const [notes, setNotes] = useState(meetingToEdit?.notes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be signed in to save a meeting.');
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
      if (meetingToEdit) {
        await updateMeeting(relationshipId, meetingToEdit.id, {
          title: title.trim(),
          date,
          time: time ? time.trim() : undefined,
          location: location ? location.trim() : undefined,
          notes: notes ? notes.trim() : undefined,
        });
      } else {
        await createMeeting(
          relationshipId,
          title.trim(),
          date,
          time ? time.trim() : undefined,
          location ? location.trim() : undefined,
          notes ? notes.trim() : undefined,
        );
      }
      onSuccess();
    } catch (err: unknown) {
      console.error('Meeting save error:', err);
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
          <span className="eyebrow">{meetingToEdit ? 'Edit Meeting' : 'Schedule Meeting'}</span>
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
              <label>Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="field">
              <label>Time (Optional)</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="field">
              <label>Title</label>
              <input
                type="text"
                placeholder="e.g. Dinner at Skyline Lounge"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="field">
              <label>Location (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Downtown Cafe"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="field">
              <label>Notes (Optional)</label>
              <textarea
                placeholder="Details, reservation times, or thoughts..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              style={{ marginTop: '10px' }}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Meeting'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
