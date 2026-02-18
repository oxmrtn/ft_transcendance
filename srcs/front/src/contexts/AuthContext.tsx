"use client";

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  token: string | null;
  username: string | null;
  userId: string | null;
  email: string | null;
  profilePictureUrl: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

interface DecodedToken {
  username: string;
  userId: string;
  exp: number;
  email: string;
  profilePictureUrl: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('jwt');
      if (storedToken)
        login(storedToken);
    } catch (error) {
      logout();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (token: string) => {
    const decodedToken = jwtDecode<DecodedToken>(token);
    if (decodedToken.exp * 1000 > Date.now()) {
      localStorage.setItem('jwt', token);
      setToken(token);
      setUsername(decodedToken.username);
      setUserId(decodedToken.userId);
      setEmail(decodedToken.email);
      setProfilePictureUrl(decodedToken.profilePictureUrl);
    } else {
      logout();
    }
  }

  const logout = () => {
    localStorage.removeItem('jwt');
    setToken(null);
    setUsername(null);
    setUserId(null);
    setEmail(null);
    setProfilePictureUrl(null);
  }

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, username, userId, email, profilePictureUrl, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export {
  AuthProvider,
  useAuth
}
