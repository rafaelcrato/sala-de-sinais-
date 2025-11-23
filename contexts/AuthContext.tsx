import React, { createContext, useContext, useState } from 'react';
import { User } from '../types';
import { ADMIN_EMAIL } from '../constants';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserLicense: (status: 'active') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always initialize as Admin User
  const defaultUser: User = {
    id: 'master-admin',
    name: 'Admin Master',
    email: ADMIN_EMAIL,
    role: 'admin',
    licenseStatus: 'active',
    joinedAt: new Date().toISOString(),
    avatar: 'https://ui-avatars.com/api/?name=Admin+Master&background=00f3ff&color=000'
  };

  const [user] = useState<User | null>(defaultUser);
  const [loading] = useState(false);

  // No-op functions
  const login = async () => {};
  const register = async () => {};
  const logout = () => {};
  const updateUserLicense = () => {};

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUserLicense }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};