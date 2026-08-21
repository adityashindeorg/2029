import { apiRequest } from './api';
import { Milestone } from '../types/milestone';

export const getMilestones = async (_relationshipId?: string): Promise<Milestone[]> => {
  return apiRequest<Milestone[]>('/api/milestones', {
    method: 'GET',
  });
};

export const createMilestone = async (
  _relationshipId: string,
  title: string,
  description: string,
  date: string
): Promise<Milestone> => {
  return apiRequest<Milestone>('/api/milestones', {
    method: 'POST',
    data: { title, description, date },
  });
};

export const updateMilestone = async (
  _relationshipId: string,
  milestoneId: string,
  updates: { title: string; description: string; date: string }
): Promise<Milestone> => {
  return apiRequest<Milestone>(`/api/milestones/${milestoneId}`, {
    method: 'PUT',
    data: updates,
  });
};

export const deleteMilestone = async (
  _relationshipId: string,
  milestoneId: string
): Promise<void> => {
  await apiRequest(`/api/milestones/${milestoneId}`, {
    method: 'DELETE',
  });
};
