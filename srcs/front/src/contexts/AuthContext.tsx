"use client";

import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { API_URL } from '../lib/utils';

interface Profile {
  username: string;
  email: string;
  profilePictureUrl: string | null;
}

interface DecodedToken {
  userId: string | number;
  exp: number;
}

interface AuthContextType {
  token: string | null;
  username: string | null;
  email: string | null;
  profilePictureUrl: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  setProfile: (profile: Profile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  const login = (token: string) => {
    const decodedToken = jwtDecode<DecodedToken>(token);
    if (decodedToken.exp * 1000 > Date.now()) {
      localStorage.setItem('jwt', token);
      setToken(token);
      fetchProfile(token);
    } else {
      logout();
    }
  }

  const logout = () => {
    localStorage.removeItem('jwt');
    setToken(null);
    setProfile(null);
  }

  const fetchProfile = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/profile/me`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setProfile({
        username: data.username,
        email: data.email,
        profilePictureUrl: data.profilePictureUrl ?? null,
      });
    } catch (error) {
      logout();
    }
  };

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('jwt');
      if (storedToken) {
        login(storedToken);
      }
    } catch (error) {
      logout();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const isAuthenticated = !!token;
  const username = profile?.username;
  const email = profile?.email;
  const profilePictureUrl = profile?.profilePictureUrl;

  return (
    <AuthContext.Provider value={{ token, username, email, profilePictureUrl, isAuthenticated, isLoading, login, logout, setProfile }}>
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
