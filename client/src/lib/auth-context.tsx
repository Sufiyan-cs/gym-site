'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from './api';

interface User {
  id: string;
  name: string;
  phone: string;
  role: 'member' | 'admin';
  subscription?: any;
  avatar?: string;
  email?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
  refreshUser: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
  refreshUser: async () => {},
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      let localUserObj: User | null = null;
      if (storedUser) {
        try { 
          localUserObj = JSON.parse(storedUser);
          setUser(localUserObj); 
        } catch (e) {}
      }
      if (storedToken) {
        setToken(storedToken);
        try {
          const userData = await api.getMe();
          let freshUser = userData.user || userData;
          if (freshUser) {
            // CRITICAL: Protect avatar_url!
            // If local storage has a real photo (base64 or custom URL) and freshUser returned empty/null/ui-avatars,
            // preserve the local photo and sync it to the backend!
            const localAvatar = localUserObj?.avatar_url || (localUserObj as any)?.avatar;
            const isLocalReal = localAvatar && typeof localAvatar === 'string' && (localAvatar.startsWith('data:image/') || (localAvatar.startsWith('http') && !localAvatar.includes('ui-avatars.com')));
            const isFreshReal = freshUser.avatar_url && typeof freshUser.avatar_url === 'string' && (freshUser.avatar_url.startsWith('data:image/') || (freshUser.avatar_url.startsWith('http') && !freshUser.avatar_url.includes('ui-avatars.com')));

            if (isLocalReal && !isFreshReal) {
              freshUser.avatar_url = localAvatar;
              // Silently sync to backend so server is also updated
              api.updateProfile({ avatar_url: localAvatar }).catch(() => {});
            }

            setUser(freshUser);
            localStorage.setItem('user', JSON.stringify(freshUser));
          }
        } catch (error) {
          console.error('Failed to fetch user', error);
          if (!localUserObj) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updated: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const merged = { ...prev, ...updated };
      localStorage.setItem('user', JSON.stringify(merged));
      return merged;
    });
  };

  const refreshUser = async () => {
    try {
      const userData = await api.getMe();
      const freshUser = userData.user || userData;
      if (freshUser) {
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
      }
    } catch (e) {
      console.error('Failed to refresh user', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, refreshUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
