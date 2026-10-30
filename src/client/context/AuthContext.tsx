import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { User } from '../api.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('omniverse_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('omniverse_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('omniverse_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
        localStorage.setItem('omniverse_user', JSON.stringify(res.data.user));
      } catch (err) {
        console.warn('Session verification failed, resetting token.');
        localStorage.removeItem('omniverse_token');
        localStorage.removeItem('omniverse_user');
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };
    verifyUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: receivedToken, user: receivedUser } = res.data;
    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem('omniverse_token', receivedToken);
    localStorage.setItem('omniverse_user', JSON.stringify(receivedUser));
  };

  const register = async (email: string, password: string, fullName: string) => {
    const res = await api.post('/auth/register', { email, password, full_name: fullName });
    const { token: receivedToken, user: receivedUser } = res.data;
    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem('omniverse_token', receivedToken);
    localStorage.setItem('omniverse_user', JSON.stringify(receivedUser));
  };

  const loginDemo = async () => {
    await login('demo@omniverse.ai', 'password123');
  };

  const logout = () => {
    localStorage.removeItem('omniverse_token');
    localStorage.removeItem('omniverse_user');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, loginDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
