import { apiRequest } from './api';
import { Relationship } from '../types/relationship';

export const getRelationship = async (): Promise<Relationship> => {
  return apiRequest<Relationship>('/api/relationship', {
    method: 'GET',
  });
};

export const updateRelationship = async (
  updates: Partial<Omit<Relationship, 'id' | 'createdAt' | 'partner1Id' | 'partner2Id'>>
): Promise<Relationship> => {
  return apiRequest<Relationship>('/api/relationship', {
    method: 'PUT',
    data: updates,
  });
};
