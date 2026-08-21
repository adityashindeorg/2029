import { useContext } from 'react';
import { RelationshipContext } from '../contexts/RelationshipContext';

export const useRelationship = () => {
  const context = useContext(RelationshipContext);
  if (!context) {
    throw new Error('useRelationship must be used within a RelationshipProvider');
  }
  return context;
};
