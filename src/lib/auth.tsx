'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi, workspacesApi } from './api';

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
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (key: string) => boolean;
  workspaceId: number | null;
  setWorkspaceId: (id: number) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWorkspace = async () => {
    try {
      const res = await workspacesApi.getAll();
      const wsList = res.data.data;
      if (wsList && wsList.length > 0) {
        const id = wsList[0].id;
        localStorage.setItem('wm_ws_id', String(id));
        setWorkspaceId(id);
      } else {
        setWorkspaceId(1);
      }
    } catch {
      setWorkspaceId(1);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('wm_token');
    const storedUser = localStorage.getItem('wm_user');
    const storedWsId = localStorage.getItem('wm_ws_id');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      if (storedWsId) {
        setWorkspaceId(parseInt(storedWsId, 10));
      } else {
        fetchWorkspace();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    const { token: t, user: u } = res.data.data;
    localStorage.setItem('wm_token', t);
    localStorage.setItem('wm_user', JSON.stringify(u));
    setToken(t);
    setUser(u);

    // Fetch and initialize workspace ID
    try {
      // Temporarily set token header manually for this initial request
      const wsRes = await workspacesApi.getAll();
      const wsList = wsRes.data.data;
      if (wsList && wsList.length > 0) {
        const id = wsList[0].id;
        localStorage.setItem('wm_ws_id', String(id));
        setWorkspaceId(id);
      } else {
        setWorkspaceId(1);
      }
    } catch {
      setWorkspaceId(1);
    }
  };

  const logout = () => {
    localStorage.removeItem('wm_token');
    localStorage.removeItem('wm_user');
    localStorage.removeItem('wm_ws_id');
    setToken(null);
    setUser(null);
    setWorkspaceId(null);
    window.location.href = '/login';
  };

  const roleTiers: Record<string, number> = {
    'Super Admin': 4,
    'Admin': 3,
  };

  const hasPermission = (key: string) => {
    if (!user) return false;
    return user.permissions?.includes(key) ?? false;
  };

  const handleSetWorkspace = (id: number) => {
    localStorage.setItem('wm_ws_id', String(id));
    setWorkspaceId(id);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, hasPermission, workspaceId, setWorkspaceId: handleSetWorkspace }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
