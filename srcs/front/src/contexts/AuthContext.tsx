"use client";

import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  token: string | null;
  username: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

interface DecodedToken {
  username: string;
  exp: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('jwt');
      if (storedToken) {
        const decodedToken = jwtDecode<DecodedToken>(storedToken);
        if (decodedToken.exp * 1000 > Date.now()) {
          setToken(storedToken);
          setUsername(decodedToken.username);
        } else {
          localStorage.removeItem('jwt');
        }
      }
    } catch (error) {
      console.error("Failed to process token on initial load:", error);
      localStorage.removeItem('jwt');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string) => {
    const decodedToken = jwtDecode<DecodedToken>(newToken);
    localStorage.setItem('jwt', newToken);
    setToken(newToken);
    setUsername(decodedToken.username);
  }

  const logout = () => {
    localStorage.removeItem('jwt');
    setToken(null);
  }

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, username, isAuthenticated, login, logout, isLoading }}>
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
