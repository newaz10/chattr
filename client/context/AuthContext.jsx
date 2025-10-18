/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */

import { createContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  const checkAuth = async () => {
    try {
      const { data } = await axios.get("api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
      }
    } catch (error) {
      console.error("Auth check failed:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`api/auth/${state}`, credentials);
      if (data.success) {
        setAuthUser(data.userData);
        const newToken = data.token;
        setToken(newToken);
        localStorage.setItem("token", newToken);
        axios.defaults.headers.common["token"] = newToken;
        toast.success(
          state === "signup"
            ? "Account created successfully"
            : "Logged in successfully"
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem("token");
      setToken(null);
      setAuthUser(null);
      setOnlineUsers([]);
      delete axios.defaults.headers.common["token"];
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null);
      window.dispatchEvent(new Event("clearChatCache"));
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("api/auth/update-profile", body);
      if (data.success) {
        setAuthUser(data.user);
        if (data.token) {
          setToken(data.token);
          localStorage.setItem("token", data.token);
          axios.defaults.headers.common["token"] = data.token;
        }
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const connectSocket = (userData) => {
    if (!userData || !token) return;

    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const newSocket = io(backendUrl, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);
  };

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["token"] = token;
      checkAuth();
    } else {
      setLoading(false);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (token && authUser) {
      connectSocket(authUser);
    } else if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
    }
  }, [token, authUser]);

  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
