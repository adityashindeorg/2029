import React, { useState } from 'react';
import { useRelationship } from '../../hooks/useRelationship';
import { useAuth } from '../../hooks/useAuth';
import { createDiaryEntry, updateDiaryEntry } from '../../services/diaryService';
import { DiaryEntry } from '../../types/diary';

interface DiaryFormProps {
  entryToEdit?: DiaryEntry | null;
  initialDate?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const DiaryForm: React.FC<DiaryFormProps> = ({
  entryToEdit,
  initialDate,
  onSuccess,
  onCancel,
}) => {
  const { relationship } = useRelationship();
  const { user } = useAuth();

  const todayStr = new Date().toISOString().split('T')[0];
  const [title, setTitle] = useState(entryToEdit?.title || '');
  const [content, setContent] = useState(entryToEdit?.content || '');
  const [date, setDate] = useState(entryToEdit?.date || initialDate || todayStr);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('You must be signed in to save a diary entry.');
      return;
    }

    const relationshipId = relationship?.id || 'default_relationship';

    if (!title.trim() || !content.trim() || !date) {
      setError('Title, content, and date are required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (entryToEdit) {
        await updateDiaryEntry(relationshipId, entryToEdit.id, {
          title: title.trim(),
          content: content.trim(),
          date,
        });
      } else {
        await createDiaryEntry(relationshipId, title.trim(), content.trim(), date);
      }
      onSuccess();
    } catch (err: unknown) {
      console.error('Diary save error:', err);
      const message = err instanceof Error ? err.message : String(err);
      setError(`Save Failed: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sheet-fs show">
      <div className="sheet-head" style={{ paddingTop: '20px' }}>
        <button type="button" className="icon-btn" onClick={onCancel}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        <span className="eyebrow">{entryToEdit ? 'Edit Diary Entry' : 'New Memory'}</span>
        <div style={{ width: '38px' }} />
      </div>

      <div className="sheet-body">
        {error && (
          <div style={{ color: '#ff8f9c', background: 'rgba(179,18,45,0.18)', borderRadius: '12px', padding: '10px', fontSize: '13px', margin: '10px 0' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field" style={{ margin: '10px 0 16px' }}>
            <label>Memory Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <input
            type="text"
            className="editor-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What happened today?"
            required
            disabled={loading}
          />
          <div className="editor-hint">Something I want to remember forever...</div>

          <textarea
            className="editor-body-input"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write everything you want to remember..."
            required
            disabled={loading}
            style={{ minHeight: '260px' }}
          />

          <button
            type="submit"
            className="btn btn-primary btn-block"
            style={{ marginTop: '20px' }}
            disabled={loading}
          >
            {loading ? 'Keeping Memory...' : 'Keep this memory'}
          </button>
        </form>
      </div>
    </div>
  );
};
