'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as authApi from '@/lib/api/auth';
import { clearRoleCookie, setRoleCookie } from '@/lib/cookies';
import type { User } from '@/types/user';
import type { LoginFormData, RegisterFormData, ProfileFormData } from '@/validators';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: ProfileFormData) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const me = await authApi.getMe();
      setUser(me);
      setRoleCookie(me.role);
    } catch {
      setUser(null);
      clearRoleCookie();
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const login = useCallback(
    async (data: LoginFormData) => {
      const response = await authApi.login(data);
      setUser(response.user);
      toast.success('Welcome back!');
      router.push('/');
    },
    [router],
  );

  const register = useCallback(
    async (data: RegisterFormData) => {
      const response = await authApi.register(data);
      setUser(response.user);
      toast.success('Account created successfully!');
      router.push('/');
    },
    [router],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      clearRoleCookie();
      toast.success('Logged out');
      router.push('/login');
    }
  }, [router]);

  const updateProfile = useCallback(async (data: ProfileFormData) => {
    const updated = await authApi.updateProfile(data);
    setUser(updated);
    toast.success('Profile updated');
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
      login,
      register,
      logout,
      updateProfile,
      refreshUser,
    }),
    [user, isLoading, login, register, logout, updateProfile, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
