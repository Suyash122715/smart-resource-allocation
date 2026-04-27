import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

const storedUser = sessionStorage.getItem('user');
const storedToken = sessionStorage.getItem('token');

export const useAuthStore = create<AuthState>((set) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  isAuthenticated: !!storedToken,

  login: (user, token) => {
    sessionStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('token', token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  setUser: (user) => {
    sessionStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
}));
