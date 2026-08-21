import { apiRequest } from './api';
import { Meeting } from '../types/meeting';

export const getMeetings = async (_relationshipId?: string): Promise<Meeting[]> => {
  return apiRequest<Meeting[]>('/api/meetings', {
    method: 'GET',
  });
};

export const createMeeting = async (
  _relationshipId: string,
  title: string,
  date: string,
  time?: string,
  location?: string,
  notes?: string
): Promise<Meeting> => {
  return apiRequest<Meeting>('/api/meetings', {
    method: 'POST',
    data: { title, date, time: time || '', location: location || '', notes: notes || '' },
  });
};

export const updateMeeting = async (
  _relationshipId: string,
  meetingId: string,
  updates: {
    title: string;
    date: string;
    time?: string;
    location?: string;
    notes?: string;
  }
): Promise<Meeting> => {
  return apiRequest<Meeting>(`/api/meetings/${meetingId}`, {
    method: 'PUT',
    data: {
      title: updates.title,
      date: updates.date,
      time: updates.time || '',
      location: updates.location || '',
      notes: updates.notes || '',
    },
  });
};

export const toggleMeetingCompleted = async (
  _relationshipId: string,
  meetingId: string,
  completed: boolean
): Promise<Meeting> => {
  return apiRequest<Meeting>(`/api/meetings/${meetingId}/completed`, {
    method: 'PATCH',
    data: { completed },
  });
};

export const deleteMeeting = async (
  _relationshipId: string,
  meetingId: string
): Promise<void> => {
  await apiRequest(`/api/meetings/${meetingId}`, {
    method: 'DELETE',
  });
};
