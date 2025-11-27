// components/Login/AuthContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useEffect, useState } from 'react';
import { loginUser, loginWithSteam, registerUser, UserData, getUserById } from '../services/auth.service';
import { fetchSteamUserData } from '@/constants/steam';

// 1. Definimos UserInfo: Es como UserData pero con 'id' OBLIGATORIO
export interface UserInfo extends UserData {
  id: number;
  avatarUrl?: string;
}

interface AuthContextProps {
  userToken: string | null;
  userInfo: UserInfo | null; // Usamos la interfaz segura
  isLoading: boolean;
  register: (data: UserData) => Promise<void>;
  login: (user: string, pass: string) => Promise<void>;
  loginSteam: (steamId: string) => Promise<void>;
  loginOrRegisterWithSteam: (steamId: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // Cargar sesión al iniciar la app
  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const info = await AsyncStorage.getItem('userInfo');

        if (token) {
          setUserToken(token);
        }
        if (info) {
          setUserInfo(JSON.parse(info));
        }
      } catch (e) {
        console.error("Error cargando sesión:", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadStorageData();
  }, []);

  // --- FUNCIÓN HELPER PARA GUARDAR SESIÓN ---
  // Centraliza la lógica para no repetirla en cada login
  const saveSession = async (user: any) => {
    // Aseguramos que user tenga formato UserInfo
    const token = user.id.toString();
    const currentUser: UserInfo = { ...user, id: user.id };

    setUserToken(token);
    setUserInfo(currentUser);

    await AsyncStorage.setItem('userToken', token);
    await AsyncStorage.setItem('userInfo', JSON.stringify(currentUser));
  };
  // --- REFRESCAR DATOS DEL USUARIO ---
  const refreshUserData = async () => {
    if (!userToken) return;

    try {
      console.log("Refrescando datos del usuario...");
      const id = parseInt(userToken);

      // 1. Obtenemos datos frescos de tu API
      const freshData = await getUserById(id);

      // 2. Formateamos
      const updatedUser: UserInfo = { ...freshData, id };

      // 3. Actualizamos estado y almacenamiento local
      setUserInfo(updatedUser);
      await AsyncStorage.setItem('userInfo', JSON.stringify(updatedUser));
      console.log("Datos refrescados correctamente.");

    } catch (error) {
      console.error("Error al refrescar usuario:", error);
      // No lanzamos error para no romper la UI del refresh control
    }
  };






  // --- LOGIN NORMAL ---
  const login = async (username: string, pass: string) => {
    setIsLoading(true);
    try {
      const userFound = await loginUser(username, pass);
      await saveSession(userFound); // Reutilizamos el helper
    } catch (e) {
      setIsLoading(false);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // --- LOGIN CON STEAM ---
  const loginSteam = async (steamId: string) => {
    setIsLoading(true);
    try {
      const userFound = await loginWithSteam(steamId);
      await saveSession(userFound); // Reutilizamos el helper
    } catch (e) {
      setIsLoading(false);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // --- LÓGICA HÍBRIDA (Login o Registro Automático) ---
  const loginOrRegisterWithSteam = async (steamId: string) => {
    setIsLoading(true);
    try {
      console.log(`Intentando login híbrido con SteamID: ${steamId}`);

      // 1. Intentamos iniciar sesión primero
      try {
        const userFound = await loginWithSteam(steamId);
        await saveSession(userFound); // Si funciona, guardamos y salimos
        return;
      } catch (loginError) {
        console.log("Usuario no encontrado, procediendo al registro...");
      }

      // 2. Si falla el login, registramos
      const steamProfile = await fetchSteamUserData(steamId);

      if (!steamProfile) {
        throw new Error("No se pudo obtener información pública de Steam.");
      }

      const randomPass = Math.random().toString(36).slice(-8) + "Steam1!";

      // const newUserData: UserData = {
      //   username: steamProfile.personaname.replace(/[^a-zA-Z0-9]/g, "") || `User${steamId.slice(-4)}`,
      //   steamId: steamId,
      //   contraseña: randomPass,
      //   pais: (steamProfile.pais && steamProfile.pais !== "Otro") ? steamProfile.pais : "Otro",
      //   edad: 18, // Valor por defecto
      //   estiloJuego: "Casual" // Valor por defecto
      // };
      const newUserData: UserData = {
        username: steamProfile.personaname.replace(/[^a-zA-Z0-9]/g, "") || `User${steamId.slice(-4)}`,
        steamId: steamId,
        contraseña: randomPass,
        pais: (steamProfile.pais && steamProfile.pais !== "Otro") ? steamProfile.pais : "Otro",
        edad: 18, 
        estiloJuego: "Casual",
        avatarUrl: steamProfile.avatar 
      };

      console.log("Registrando usuario automático:", newUserData.username);

      const userRegistered = await registerUser(newUserData);

      if (userRegistered && userRegistered.id) {
        const userForSession = { ...userRegistered, avatarUrl: newUserData.avatarUrl };
        await saveSession(userForSession); // Guardamos la sesión del nuevo usuario
      } else {
        throw new Error("El registro no devolvió un ID válido.");
      }

    } catch (e) {
      console.error("Error en Auth Híbrido:", e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // --- REGISTER MANUAL ---
  const register = async (data: UserData) => {
    setIsLoading(true);
    try {
      const userRegistered = await registerUser(data);
      if (userRegistered && userRegistered.id) {
        await saveSession(userRegistered);
      }
    } catch (e) {
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
      setUserInfo(null);
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userInfo');
    } catch (e) {
      console.error("Error al cerrar sesión", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      userToken,
      userInfo,
      isLoading,
      register,
      login,
      loginSteam,
      loginOrRegisterWithSteam,
      logout,
      refreshUserData
    }}>
      {children}
    </AuthContext.Provider>
  );
};