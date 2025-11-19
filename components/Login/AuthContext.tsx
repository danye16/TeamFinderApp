// components/Login/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerUser, loginUser, UserData } from './auth.service'; // <--- Agregamos loginUser

interface AuthContextProps {
  userToken: string | null;
  isLoading: boolean;
  register: (data: UserData) => Promise<void>;
  login: (user: string, pass: string) => Promise<void>; // <--- Nueva función
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) setUserToken(token);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadStorageData();
  }, []);

  // --- LOGIN ---
  const login = async (username: string, pass: string) => {
    setIsLoading(true);
    try {
      const userFound = await loginUser(username, pass);
      
      // Usamos el ID o Username como token simple
      const token = userFound.id.toString(); 
      
      setUserToken(token);
      await AsyncStorage.setItem('userToken', token);
      // Opcional: Guardar todo el objeto usuario si quieres mostrar el perfil luego
      await AsyncStorage.setItem('userInfo', JSON.stringify(userFound));

    } catch (e) {
      setIsLoading(false);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // --- REGISTER ---
  const register = async (data: UserData) => {
    setIsLoading(true);
    try {
      await registerUser(data);
      // Si el registro es exitoso, hacemos login automático o pedimos loguear.
      // En este caso, hacemos login automático:
      await login(data.username, data.password || '');
    } catch (e) {
      setIsLoading(false);
      throw e; 
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setUserToken(null);
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userInfo');
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ userToken, isLoading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};