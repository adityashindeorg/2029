import React, { useEffect, useState, useMemo } from 'react';
import { useRelationship } from '../../hooks/useRelationship';
import { getMilestones, deleteMilestone } from '../../services/milestoneService';
import { Milestone } from '../../types/milestone';
import { MilestoneForm } from './MilestoneForm';

export const MilestoneList: React.FC = () => {
  const { relationship } = useRelationship();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [view, setView] = useState<'moments' | 'timeline'>('moments');

  const loadMilestones = async () => {
    if (!relationship) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getMilestones(relationship.id);
      setMilestones(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load milestones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (relationship) {
      loadMilestones();
    } else {
      setLoading(false);
    }
  }, [relationship]);

  // Listen to FAB click event
  useEffect(() => {
    const handleFabOpen = () => setShowAddForm(true);
    window.addEventListener('open-milestone-editor', handleFabOpen);
    return () => window.removeEventListener('open-milestone-editor', handleFabOpen);
  }, []);

  const handleDelete = async (milestoneId: string) => {
    if (!relationship) return;
    if (!window.confirm('Are you sure you want to delete this milestone?')) return;

    try {
      await deleteMilestone(relationship.id, milestoneId);
      setMilestones((prev) => prev.filter((m) => m.id !== milestoneId));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete milestone.');
    }
  };

  // Group milestones by year for timeline view
  const timelineGroups = useMemo(() => {
    const groups: { [year: string]: Milestone[] } = {};
    milestones.forEach((m) => {
      const year = m.date.split('-')[0] || 'Unknown';
      if (!groups[year]) groups[year] = [];
      groups[year].push(m);
    });
    return Object.entries(groups).sort(([y1], [y2]) => y1.localeCompare(y2));
  }, [milestones]);

  return (
    <div>
      {/* Top App Bar */}
      <div className="app-topbar">
        <div>
          <div className="greeting" style={{ fontSize: '24px' }}>Moments</div>
          <p style={{ fontSize: '13px', color: 'var(--gray)', marginTop: '4px', fontStyle: 'italic', fontFamily: 'var(--serif)' }}>
            Moments worth keeping, in words.
          </p>
        </div>
        <button className="icon-btn" onClick={() => setShowAddForm(true)} title="Add Milestone">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      {/* View Toggle */}
      <div className="view-toggle" style={{ marginTop: '16px' }}>
        <button
          type="button"
          className={view === 'moments' ? 'active' : ''}
          onClick={() => setView('moments')}
        >
          Moments
        </button>
        <button
          type="button"
          className={view === 'timeline' ? 'active' : ''}
          onClick={() => setView('timeline')}
        >
          Timeline
        </button>
      </div>

      {error && (
        <div style={{ margin: '10px 22px', color: '#ff8f9c', background: 'rgba(179,18,45,0.18)', borderRadius: '12px', padding: '12px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--gray)' }}>
          <p className="onb-tagline">Loading moments...</p>
        </div>
      ) : milestones.length === 0 ? (
        <div className="empty-state">
          <div className="glyph">
            <span className="ui-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.8 8.7c0 5.2-8.8 10.1-8.8 10.1S3.2 13.9 3.2 8.7A4.7 4.7 0 0 1 12 6.1a4.7 4.7 0 0 1 8.8 2.6Z" />
              </svg>
            </span>
          </div>
          <div className="h">No milestones yet.</div>
          <div className="s">Add your first memorable moment.</div>
          <button className="btn btn-primary" onClick={() => setShowAddForm(true)} style={{ margin: '0 auto' }}>
            Add Milestone
          </button>
        </div>
      ) : view === 'moments' ? (
        <div style={{ paddingTop: '8px' }}>
          {milestones.map((milestone, idx) => (
            <div key={milestone.id} className="memory-item">
              <div className="rail">
                <div className="node" />
                {idx < milestones.length - 1 && <div className="line" />}
              </div>
              <div className="card">
                <div className="cat">Milestone</div>
                <div className="title serif">{milestone.title}</div>
                <div className="date">{milestone.date}</div>
                {milestone.description && <div className="body">{milestone.description}</div>}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                  <button
                    type="button"
                    className="btn-text"
                    style={{ fontSize: '12px', padding: '4px 8px' }}
                    onClick={() => setEditingMilestone(milestone)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn-text"
                    style={{ fontSize: '12px', padding: '4px 8px', color: '#ff8f9c' }}
                    onClick={() => handleDelete(milestone.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ paddingBottom: '20px' }}>
          {timelineGroups.map(([year, list]) => (
            <div key={year}>
              <div className="tl-year">{year}</div>
              {list.map((m) => (
                <div key={m.id} className="tl-item">
                  <div className="mark" />
                  <div className="txt" style={{ flex: 1 }}>
                    <span style={{ fontWeight: 700 }}>{m.date}:</span> {m.title}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Sheet Form Modal */}
      {(showAddForm || editingMilestone) && (
        <MilestoneForm
          milestoneToEdit={editingMilestone}
          onSuccess={() => {
            setShowAddForm(false);
            setEditingMilestone(null);
            loadMilestones();
          }}
          onCancel={() => {
            setShowAddForm(false);
            setEditingMilestone(null);
          }}
        />
      )}

      <div style={{ height: '30px' }} />
    </div>
  );
};
