import React, { useEffect, useState } from 'react';
import { useRelationship } from '../../hooks/useRelationship';
import { getMeetings, toggleMeetingCompleted, deleteMeeting } from '../../services/meetingService';
import { Meeting } from '../../types/meeting';
import { MeetingForm } from './MeetingForm';

export const MeetingList: React.FC = () => {
  const { relationship } = useRelationship();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const loadMeetings = async () => {
    if (!relationship) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getMeetings(relationship.id);
      setMeetings(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load meetings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (relationship) {
      loadMeetings();
    } else {
      setLoading(false);
    }
  }, [relationship]);

  // Listen to FAB click event
  useEffect(() => {
    const handleFabOpen = () => setShowAddForm(true);
    window.addEventListener('open-meeting-editor', handleFabOpen);
    return () => window.removeEventListener('open-meeting-editor', handleFabOpen);
  }, []);

  const handleToggleCompleted = async (meeting: Meeting) => {
    if (!relationship) return;
    try {
      await toggleMeetingCompleted(relationship.id, meeting.id, !meeting.completed);
      setMeetings((prev) =>
        prev.map((m) => (m.id === meeting.id ? { ...m, completed: !m.completed } : m))
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update meeting completion.');
    }
  };

  const handleDelete = async (meetingId: string) => {
    if (!relationship) return;
    if (!window.confirm('Are you sure you want to delete this meeting?')) return;

    try {
      await deleteMeeting(relationship.id, meetingId);
      setMeetings((prev) => prev.filter((m) => m.id !== meetingId));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete meeting.');
    }
  };

  return (
    <div>
      {/* Top App Bar */}
      <div className="app-topbar">
        <div>
          <div className="greeting" style={{ fontSize: '24px' }}>Meetings</div>
          <p style={{ fontSize: '13px', color: 'var(--gray)', marginTop: '4px', fontStyle: 'italic', fontFamily: 'var(--serif)' }}>
            Time spent together.
          </p>
        </div>
        <button className="icon-btn" onClick={() => setShowAddForm(true)} title="Schedule Meeting">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      <div className="sec-head">
        <span className="eyebrow">Upcoming &amp; Past Dates</span>
      </div>

      {error && (
        <div style={{ margin: '10px 22px', color: '#ff8f9c', background: 'rgba(179,18,45,0.18)', borderRadius: '12px', padding: '12px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--gray)' }}>
          <p className="onb-tagline">Loading meetings...</p>
        </div>
      ) : meetings.length === 0 ? (
        <div className="empty-state">
          <div className="glyph">
            <span className="ui-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </span>
          </div>
          <div className="h">No meetings scheduled.</div>
          <div className="s">Plan your next date or dinner together.</div>
          <button className="btn btn-primary" onClick={() => setShowAddForm(true)} style={{ margin: '0 auto' }}>
            Schedule Meeting
          </button>
        </div>
      ) : (
        meetings.map((meeting) => (
          <div
            key={meeting.id}
            className="meeting-card"
            style={{
              opacity: meeting.completed ? 0.65 : 1,
            }}
          >
            <div className="row1">
              <span className={`badge ${meeting.completed ? 'badge-completed' : 'badge-gold'}`}>
                {meeting.completed ? '✓ Completed' : 'Upcoming'}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--gray-dim)', fontWeight: 700 }}>
                {meeting.date} {meeting.time ? `@ ${meeting.time}` : ''}
              </span>
            </div>
            <div
              className="title"
              style={{
                textDecoration: meeting.completed ? 'line-through' : 'none',
              }}
            >
              {meeting.title}
            </div>
            {meeting.location && (
              <div style={{ fontSize: '12.5px', color: 'var(--gold)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📍</span> {meeting.location}
              </div>
            )}
            {meeting.notes && <div className="notes">{meeting.notes}</div>}

            <div className="meta" style={{ marginTop: '12px', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', textTransform: 'none', color: 'var(--ivory-dim)' }}>
                <input
                  type="checkbox"
                  checked={meeting.completed}
                  onChange={() => handleToggleCompleted(meeting)}
                  style={{ accentColor: 'var(--crimson-bright)' }}
                />
                {meeting.completed ? 'Completed' : 'Mark as done'}
              </label>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-text"
                  style={{ fontSize: '12px', padding: '4px 8px' }}
                  onClick={() => setEditingMeeting(meeting)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn-text"
                  style={{ fontSize: '12px', padding: '4px 8px', color: '#ff8f9c' }}
                  onClick={() => handleDelete(meeting.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Modal Form */}
      {(showAddForm || editingMeeting) && (
        <MeetingForm
          meetingToEdit={editingMeeting}
          onSuccess={() => {
            setShowAddForm(false);
            setEditingMeeting(null);
            loadMeetings();
          }}
          onCancel={() => {
            setShowAddForm(false);
            setEditingMeeting(null);
          }}
        />
      )}

      <div style={{ height: '30px' }} />
    </div>
  );
};
