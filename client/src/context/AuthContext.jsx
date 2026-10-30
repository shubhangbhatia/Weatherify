import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Direct access: default to full administrative privileges without requiring authentication
  const [user, setUser] = useState({
    id: 1,
    full_name: 'Lead Administrator',
    email: 'admin@suratweather.edu',
    role: 'admin'
  });
  const [token, setToken] = useState('bypass_token');
  const [loading, setLoading] = useState(false);

  const login = async () => user;
  const register = async () => user;
  const logout = () => {};

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAdmin: true,
        isAuthenticated: true
      }}
    >
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
