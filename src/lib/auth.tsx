'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from './api';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar?: string;
  jobTitle?: string;
  isActive: boolean;
  roles: string[];
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, inviteToken?: string) => Promise<{ boardId?: number }>;
  loginWithOtp: (email: string, otp: string, inviteToken?: string) => Promise<{ boardId?: number }>;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
  isLoading: boolean;
  hasPermission: (key: string) => boolean;
  workspaceId: number | null;
  setWorkspaceId: (id: number) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('wm_token');
    const storedUser = localStorage.getItem('wm_user');
    if (storedToken && storedUser) {
      if (isTokenExpired(storedToken)) {
        localStorage.removeItem('wm_token');
        localStorage.removeItem('wm_user');
        localStorage.removeItem('wm_ws_id');
      } else {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, inviteToken?: string) => {
    const res = await authApi.login(email, password, inviteToken);
    const { token: t, user: u, boardId } = res.data.data;
    localStorage.setItem('wm_token', t);
    localStorage.setItem('wm_user', JSON.stringify(u));
    setToken(t);
    setUser(u);
    return { boardId };
  };

  const loginWithOtp = async (email: string, otp: string, inviteToken?: string) => {
    const res = await authApi.loginWithOtp(email, otp, inviteToken);
    const { token: t, user: u, boardId } = res.data.data;
    localStorage.setItem('wm_token', t);
    localStorage.setItem('wm_user', JSON.stringify(u));
    setToken(t);
    setUser(u);
    return { boardId };
  };

  const logout = () => {
    localStorage.removeItem('wm_token');
    localStorage.removeItem('wm_user');
    localStorage.removeItem('wm_ws_id');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedData: Partial<User>) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const firstName = updatedData.firstName !== undefined ? updatedData.firstName : prevUser.firstName;
      const lastName = updatedData.lastName !== undefined ? updatedData.lastName : prevUser.lastName;
      const fullName = `${firstName} ${lastName}`.trim();
      const updated: User = {
        ...prevUser,
        ...updatedData,
        firstName,
        lastName,
        fullName: updatedData.fullName || fullName,
      };
      localStorage.setItem('wm_user', JSON.stringify(updated));
      return updated;
    });
  };

  const hasPermission = (key: string) => {
    if (!user) return false;
    return user.permissions?.includes(key) ?? false;
  };

  return (
    <AuthContext.Provider value={{ user, token, login, loginWithOtp, logout, updateUser, isLoading, hasPermission, workspaceId: 1, setWorkspaceId: () => {} }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
