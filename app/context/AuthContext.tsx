"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  UserLoginDto,
  UserCreateDto,
  LoginResponse,
  UserResponseDto,
} from "../types/auth";
import { loginUser, registerUser } from "@/app/api/auth";

interface AuthContextType {
  user: UserResponseDto | null;
  login: (credentials: UserLoginDto) => Promise<LoginResponse | null>;
  register: (userData: UserCreateDto) => Promise<LoginResponse | null>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserResponseDto | null>(null);
  const [loading, setLoading] = useState(true); // Set to `true` initially
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const login = async (
    credentials: UserLoginDto
  ): Promise<LoginResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      const { token, user } = await loginUser(credentials);
      localStorage.setItem("token", token);
      setUser(user);
      return { token, user };
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    userData: UserCreateDto
  ): Promise<LoginResponse | null> => {
    try {
      setLoading(true);
      setError(null);
      const { token, user } = await registerUser(userData);
      localStorage.setItem("token", token);
      setUser(user);
      return { token, user };
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const isAuthenticated = !!user;

  // Load user data on initial load
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          setLoading(true);
          // Fetch user data from the backend using the token
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/status`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const userData: UserResponseDto = await response.json();
            setUser(userData);
          } else {
            logout(); 
          }
        } catch (err) {
          console.error("Failed to load user:", err);
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        error,
        isAuthenticated,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
