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
  UserRole,
} from "../types/auth";
import { loginUser, registerUser } from "@/app/api/auth";
import { redirect } from "next/dist/server/api-utils";

interface AuthContextType {
  user: UserResponseDto | null;
  login: (credentials: UserLoginDto) => Promise<LoginResponse | null>;
  register: (userData: UserCreateDto) => Promise<LoginResponse | null>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  updateUserOrganisation: (organisationId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserResponseDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserData(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/status`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch user data");

      const userData: UserResponseDto = await response.json();
      console.log(userData);
      setUser(userData);
    } catch (error) {
      console.error(error);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const updateUserOrganisation = (organisationId: string) => {
    if (user) {
      const updatedUser = {
        ...user,
        organisationId:
          typeof organisationId === "string"
            ? parseInt(organisationId, 10)
            : organisationId,
      };
      setUser(updatedUser);
    }
  };

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
    } catch (error) {
      setError((error as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    userData: UserCreateDto
  ): Promise<LoginResponse | null> => {
    try { 
        console.log(userData);
      setLoading(true);
      setError(null);
      const { token, user } = await registerUser(userData);
      localStorage.setItem("token", token);
      setUser(user);
      return { token, user };
    } catch (error) {
      setError((error as Error).message);
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

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, error, isAuthenticated, updateUserOrganisation }}>
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
