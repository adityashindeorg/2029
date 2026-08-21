import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Relationship } from '../types/relationship';
import { getRelationship, updateRelationship } from '../services/relationshipService';
import { useAuth } from '../hooks/useAuth';

interface RelationshipContextType {
  relationship: Relationship | null;
  loading: boolean;
  error: string | null;
  updateRelationshipDetails: (
    updates: Partial<Omit<Relationship, 'id' | 'createdAt' | 'partner1Id' | 'partner2Id'>>
  ) => Promise<void>;
  refreshRelationship: () => Promise<void>;
}

export const RelationshipContext = createContext<RelationshipContextType | undefined>(undefined);

export const RelationshipProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [relationship, setRelationship] = useState<Relationship | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRelationship = async () => {
    if (!user) {
      setRelationship(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const rel = await getRelationship();
      setRelationship(rel);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load relationship info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRelationship();
    } else {
      setRelationship(null);
    }
  }, [user]);

  const updateRelationshipDetails = async (
    updates: Partial<Omit<Relationship, 'id' | 'createdAt' | 'partner1Id' | 'partner2Id'>>
  ) => {
    if (!relationship) return;
    setError(null);
    try {
      const updated = await updateRelationship(updates);
      setRelationship(updated);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update relationship info');
      throw err;
    }
  };

  return (
    <RelationshipContext.Provider
      value={{
        relationship,
        loading,
        error,
        updateRelationshipDetails,
        refreshRelationship: fetchRelationship,
      }}
    >
      {children}
    </RelationshipContext.Provider>
  );
};
