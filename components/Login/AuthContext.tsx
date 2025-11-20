// components/Login/AuthContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useEffect, useState } from 'react';
// IMPORTANTE: Asegúrate de que loginWithSteam esté exportado en tu auth.service
import { loginUser, loginWithSteam, registerUser, UserData } from './auth.service';

interface AuthContextProps {
  userToken: string | null;
  isLoading: boolean;
  register: (data: UserData) => Promise<void>;
  login: (user: string, pass: string) => Promise<void>;
  loginSteam: (steamId: string) => Promise<void>; // <--- Función para Steam
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userToken, setUserToken] = useState<string | null>(null);

  // Cargar sesión al iniciar la app
  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          setUserToken(token);
        }
      } catch (e) {
        console.error("Error cargando token:", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadStorageData();
  }, []);

  // --- LOGIN NORMAL (Usuario y Contraseña) ---
  const login = async (username: string, pass: string) => {
    setIsLoading(true);
    try {
      console.log(`Intentando login normal para: ${username}`);
      const userFound = await loginUser(username, pass);

      // SOLUCIÓN TYPESCRIPT: Usamos (as any) para evitar el error de la propiedad 'id'
      const token = (userFound as any).id.toString();

      setUserToken(token);
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userInfo', JSON.stringify(userFound));

    } catch (e) {
      setIsLoading(false);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // --- LOGIN CON STEAM (Solo SteamID) ---
  const loginSteam = async (steamId: string) => {
    setIsLoading(true);
    try {
      console.log(`Intentando login con SteamID: ${steamId}`);
      // Llamamos al nuevo endpoint que no pide contraseña
      const userFound = await loginWithSteam(steamId);

      // SOLUCIÓN TYPESCRIPT: Usamos (as any) aquí también
      const token = (userFound as any).id.toString();

      setUserToken(token);
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userInfo', JSON.stringify(userFound));

    } catch (e) {
      setIsLoading(false);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // --- REGISTER (CORREGIDO) ---
  // --- REGISTER (CORREGIDO) ---
  const register = async (data: UserData) => {
    setIsLoading(true);
    try {
      console.log("1. Iniciando registro para:", data.username);

      // Paso A: Registrar en backend
      const userRegistered = await registerUser(data);
      console.log("2. Registro exitoso en Backend. Estableciendo sesión...");

      // Paso B: Establecer sesión directamente con los datos del usuario registrado
      // CORRECIÓN CRÍTICA: Usamos los datos del usuario registrado en lugar de hacer login
      if (userRegistered && userRegistered.id) {
        const token = userRegistered.id.toString();

        setUserToken(token);
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userInfo', JSON.stringify(userRegistered));
      } else {
        // Si el registro no devuelve los datos del usuario, intentamos hacer login
        console.log("El registro no devolvió los datos del usuario. Intentando login...");
        if (data.steamId) {
          console.log("🔄 Detectado registro con Steam. Usando loginSteam...");
          await loginSteam(data.steamId);
        } else {
          console.log("🔄 Detectado registro manual. Usando login con password...");
          await login(data.username, data.contraseña || '');
        }
      }

    } catch (e) {
      console.error("Error en AuthContext register:", e);
      setIsLoading(false);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // --- LOGOUT ---
  const logout = async () => {
    setIsLoading(true);
    try {
      setUserToken(null);
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userInfo');
    } catch (e) {
      console.error("Error al cerrar sesión", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ userToken, isLoading, register, login, loginSteam, logout }}>
      {children}
    </AuthContext.Provider>
  );
};