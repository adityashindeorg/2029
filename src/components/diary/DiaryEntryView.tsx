import React from 'react';
import { DiaryEntry } from '../../types/diary';

interface DiaryEntryViewProps {
  entry: DiaryEntry;
  onBack: () => void;
  onEdit: () => void;
  onDelete: (id: string) => void;
}

export const DiaryEntryView: React.FC<DiaryEntryViewProps> = ({
  entry,
  onBack,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="sheet-fs show">
      <div className="sheet-head" style={{ paddingTop: '20px' }}>
        <button type="button" className="icon-btn" onClick={onBack}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <span className="badge badge-shared">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ width: '12px', height: '12px' }}>
            <path d="M20.8 8.7c0 5.2-8.8 10.1-8.8 10.1S3.2 13.9 3.2 8.7A4.7 4.7 0 0 1 12 6.1a4.7 4.7 0 0 1 8.8 2.6Z" />
          </svg>
          Shared
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" className="icon-btn" onClick={onEdit} title="Edit Entry">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            type="button"
            className="icon-btn"
            style={{ color: '#ff8f9c' }}
            onClick={() => onDelete(entry.id)}
            title="Delete Entry"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </div>

      <div className="sheet-body">
        <div className="reader-date">{entry.date}</div>
        <div className="reader-title serif">{entry.title}</div>
        <div className="reader-body">{entry.content}</div>

        <div className="reader-signoff">
          <span>Written by {entry.createdBy || 'Us'}</span>
          <span>Shared forever in our journal</span>
        </div>
      </div>
    </div>
  );
};
