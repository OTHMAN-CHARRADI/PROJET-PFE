import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, getMe } from '../service/Api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('infobot_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('infobot_token');
      if (savedToken) {
        try {
          const userData = await getMe();
          setUser(userData);
          setToken(savedToken);
        } catch (error) {
          localStorage.removeItem('infobot_token');
          localStorage.removeItem('infobot_user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const data = await apiLogin(email, password);
    const accessToken = data.access_token;
    localStorage.setItem('infobot_token', accessToken);
    setToken(accessToken);
    const userData = await getMe();
    setUser(userData);
    localStorage.setItem('infobot_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (username, email, password, role = 'USER', adminCode = undefined) => {
    return await apiRegister(username, email, password, role, adminCode);
  };

  const logout = () => {
    localStorage.removeItem('infobot_token');
    localStorage.removeItem('infobot_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const userData = await getMe();
      setUser(userData);
      localStorage.setItem('infobot_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Erreur rafraîchissement profil:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user, token, loading, login, register, logout, refreshUser,
      isAuthenticated: !!token && !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;