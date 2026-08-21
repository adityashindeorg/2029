import { apiRequest } from './api';
import { DiaryEntry } from '../types/diary';

export const getDiaryEntries = async (_relationshipId?: string): Promise<DiaryEntry[]> => {
  return apiRequest<DiaryEntry[]>('/api/diary', {
    method: 'GET',
  });
};

export const createDiaryEntry = async (
  _relationshipId: string,
  title: string,
  content: string,
  date: string
): Promise<DiaryEntry> => {
  return apiRequest<DiaryEntry>('/api/diary', {
    method: 'POST',
    data: { title, content, date },
  });
};

export const updateDiaryEntry = async (
  _relationshipId: string,
  entryId: string,
  updates: { title: string; content: string; date: string }
): Promise<DiaryEntry> => {
  return apiRequest<DiaryEntry>(`/api/diary/${entryId}`, {
    method: 'PUT',
    data: updates,
  });
};

export const deleteDiaryEntry = async (
  _relationshipId: string,
  entryId: string
): Promise<void> => {
  await apiRequest(`/api/diary/${entryId}`, {
    method: 'DELETE',
  });
};
