import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api, { apiError } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);        // null=loading, false=guest, obj=user
  const [booting, setBooting] = useState(true);

  const loadMe = useCallback(async () => {
    const token = localStorage.getItem("hfsbag_token");
    if (!token) {
      setUser(false);
      setBooting(false);
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch (e) {
      localStorage.removeItem("hfsbag_token");
      setUser(false);
    } finally {
      setBooting(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("hfsbag_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem("hfsbag_token", data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("hfsbag_token");
    setUser(false);
  };

  return (
    <AuthContext.Provider value={{ user, booting, login, register, logout, refresh: loadMe, apiError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
