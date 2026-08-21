import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRelationship } from '../../hooks/useRelationship';
import { getDiaryEntries, deleteDiaryEntry } from '../../services/diaryService';
import { DiaryEntry } from '../../types/diary';
import { DiaryForm } from './DiaryForm';
import { DiaryEntryView } from './DiaryEntryView';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const WDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const DiaryList: React.FC = () => {
  const { relationship } = useRelationship();
  const [searchParams, setSearchParams] = useSearchParams();

  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Month navigation
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedFilterDate, setSelectedFilterDate] = useState<string | null>(null);

  const loadEntries = async () => {
    if (!relationship) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getDiaryEntries(relationship.id);
      setEntries(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load diary entries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (relationship) {
      loadEntries();
    } else {
      setLoading(false);
    }
  }, [relationship]);

  // Handle URL query actions
  useEffect(() => {
    const action = searchParams.get('action');
    const readId = searchParams.get('read');
    if (action === 'create') {
      setShowAddForm(true);
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
    if (readId && entries.length > 0) {
      const target = entries.find((e) => e.id === readId);
      if (target) {
        setSelectedEntry(target);
        searchParams.delete('read');
        setSearchParams(searchParams, { replace: true });
      }
    }
  }, [searchParams, entries, setSearchParams]);

  // Listen to FAB click event
  useEffect(() => {
    const handleFabOpen = () => setShowAddForm(true);
    window.addEventListener('open-diary-editor', handleFabOpen);
    return () => window.removeEventListener('open-diary-editor', handleFabOpen);
  }, []);

  const handleDelete = async (entryId: string) => {
    if (!relationship) return;
    if (!window.confirm('Are you sure you want to delete this memory?')) return;

    try {
      await deleteDiaryEntry(relationship.id, entryId);
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
      if (selectedEntry?.id === entryId) setSelectedEntry(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete entry.');
    }
  };

  const shiftMonth = (dir: number) => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + dir, 1));
    setSelectedFilterDate(null);
  };

  // Calendar dates for the current view month
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const numDays = new Date(year, month + 1, 0).getDate();
    const daysArr = [];
    for (let d = 1; d <= numDays; d++) {
      const dateObj = new Date(year, month, d);
      const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const hasEntry = entries.some((e) => e.date === iso);
      daysArr.push({
        dayNumber: d,
        weekday: WDAYS[dateObj.getDay()],
        iso,
        hasEntry,
      });
    }
    return daysArr;
  }, [viewDate, entries]);

  // Filtered entries
  const displayedEntries = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    if (selectedFilterDate) {
      return entries.filter((e) => e.date === selectedFilterDate);
    }

    return entries.filter((e) => {
      const [y, m] = e.date.split('-').map(Number);
      return y === year && m === month + 1;
    });
  }, [entries, viewDate, selectedFilterDate]);

  return (
    <div>
      {/* Top App Bar */}
      <div className="app-topbar" style={{ paddingBottom: 0 }}>
        <div>
          <div className="greeting" style={{ fontSize: '24px' }}>Journal</div>
          <p style={{ fontSize: '13px', color: 'var(--gray)', marginTop: '4px', fontStyle: 'italic', fontFamily: 'var(--serif)' }}>
            Every day has a story.
          </p>
        </div>
        <button className="icon-btn" onClick={() => setShowAddForm(true)} title="New Diary Entry">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      {/* Month Navigator */}
      <div className="month-nav">
        <button className="icon-btn" style={{ width: '32px', height: '32px' }} onClick={() => shiftMonth(-1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <div className="lbl">
          {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
        </div>
        <button className="icon-btn" style={{ width: '32px', height: '32px' }} onClick={() => shiftMonth(1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Date Strip */}
      <div className="date-strip">
        {calendarDays.map((item) => (
          <div
            key={item.iso}
            className={`date-chip ${item.hasEntry ? 'has-entry' : ''} ${selectedFilterDate === item.iso ? 'sel' : ''}`}
            onClick={() => {
              setSelectedFilterDate(selectedFilterDate === item.iso ? null : item.iso);
            }}
          >
            <div className="d">{item.dayNumber}</div>
            <div className="w">{item.weekday}</div>
          </div>
        ))}
      </div>

      {/* Section Header */}
      <div className="sec-head">
        <span className="eyebrow">
          {selectedFilterDate ? `Entries on ${selectedFilterDate}` : `${MONTH_NAMES[viewDate.getMonth()]} Entries`}
        </span>
        {selectedFilterDate && (
          <span className="link" onClick={() => setSelectedFilterDate(null)}>
            Show all month
          </span>
        )}
      </div>

      {error && (
        <div style={{ margin: '10px 22px', color: '#ff8f9c', background: 'rgba(179,18,45,0.18)', borderRadius: '12px', padding: '12px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--gray)' }}>
          <p className="onb-tagline">Opening Journal...</p>
        </div>
      ) : displayedEntries.length === 0 ? (
        <div className="empty-state">
          <div className="glyph">✒</div>
          <div className="h">No memories yet.</div>
          <div className="s">Tonight could be the first page.</div>
          <button className="btn btn-primary" onClick={() => setShowAddForm(true)} style={{ margin: '0 auto' }}>
            Write something
          </button>
        </div>
      ) : (
        displayedEntries.map((entry) => (
          <div key={entry.id} className="diary-card" onClick={() => setSelectedEntry(entry)}>
            <div className="row1">
              <span className="badge badge-shared">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ width: '12px', height: '12px' }}>
                  <path d="M20.8 8.7c0 5.2-8.8 10.1-8.8 10.1S3.2 13.9 3.2 8.7A4.7 4.7 0 0 1 12 6.1a4.7 4.7 0 0 1 8.8 2.6Z" />
                </svg>
                Memory
              </span>
              <span style={{ fontSize: '11px', color: 'var(--gray-dim)', fontWeight: 700 }}>{entry.date}</span>
            </div>
            <div className="title">{entry.title}</div>
            <div className="excerpt">{entry.content}</div>
            <div className="meta" style={{ marginTop: '10px', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                className="btn-text"
                style={{ fontSize: '12px', padding: '4px 8px' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingEntry(entry);
                }}
              >
                Edit
              </button>
              <button
                type="button"
                className="btn-text"
                style={{ fontSize: '12px', padding: '4px 8px', color: '#ff8f9c' }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(entry.id);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}

      {/* Reader Modal */}
      {selectedEntry && (
        <DiaryEntryView
          entry={selectedEntry}
          onBack={() => setSelectedEntry(null)}
          onEdit={() => {
            setEditingEntry(selectedEntry);
            setSelectedEntry(null);
          }}
          onDelete={handleDelete}
        />
      )}

      {/* Editor Modal */}
      {(showAddForm || editingEntry) && (
        <DiaryForm
          entryToEdit={editingEntry}
          initialDate={selectedFilterDate || undefined}
          onSuccess={() => {
            setShowAddForm(false);
            setEditingEntry(null);
            loadEntries();
          }}
          onCancel={() => {
            setShowAddForm(false);
            setEditingEntry(null);
          }}
        />
      )}

      <div style={{ height: '30px' }} />
    </div>
  );
};
