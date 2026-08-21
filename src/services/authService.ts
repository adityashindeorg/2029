import { apiRequest, setStoredToken, getStoredToken } from './api';
import { UserProfile } from '../types/user';

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

export const loginWithTOTP = async (identifier: string, code: string): Promise<UserProfile> => {
  const data = await apiRequest<AuthResponse>('/api/auth/login', {
    method: 'POST',
    data: { identifier, code },
  });
  setStoredToken(data.access_token);
  return data.user;
};

export const getCurrentUser = async (): Promise<UserProfile | null> => {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const user = await apiRequest<UserProfile>('/api/auth/me', {
      method: 'GET',
    });
    return user;
  } catch {
    setStoredToken(null);
    return null;
  }
};

export const logoutUser = async (): Promise<void> => {
  setStoredToken(null);
};
