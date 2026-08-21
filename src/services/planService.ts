import { apiRequest } from './api';
import { Plan } from '../types/plan';

export const getPlans = async (_relationshipId?: string): Promise<Plan[]> => {
  return apiRequest<Plan[]>('/api/plans', {
    method: 'GET',
  });
};

export const createPlan = async (
  _relationshipId: string,
  title: string,
  description: string,
  date: string
): Promise<Plan> => {
  return apiRequest<Plan>('/api/plans', {
    method: 'POST',
    data: { title, description, date },
  });
};

export const updatePlan = async (
  _relationshipId: string,
  planId: string,
  updates: {
    title: string;
    description: string;
    date: string;
  }
): Promise<Plan> => {
  return apiRequest<Plan>(`/api/plans/${planId}`, {
    method: 'PUT',
    data: updates,
  });
};

export const togglePlanCompleted = async (
  _relationshipId: string,
  planId: string,
  completed: boolean
): Promise<Plan> => {
  return apiRequest<Plan>(`/api/plans/${planId}/completed`, {
    method: 'PATCH',
    data: { completed },
  });
};

export const deletePlan = async (
  _relationshipId: string,
  planId: string
): Promise<void> => {
  await apiRequest(`/api/plans/${planId}`, {
    method: 'DELETE',
  });
};
