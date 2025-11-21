import AsyncStorage from '@react-native-async-storage/async-storage';
import CryptoJS from 'crypto-js'; // <--- NECESARIO para que funcione hashPassword

// Definición de tipos
export interface UserData {
  id?: number;
  username: string;
  contraseña?: string;
  steamId: string;
  pais: string;
  edad: number;
  estiloJuego: string;
}

export interface ApiUserResponse {
  id: number;
  username: string;
  steamId: string;
  contraseña?: string;
}

const BASE_URL = 'http://teamfinderapiv2.somee.com/api/Usuarios';

// --- ESTA ES LA FUNCIÓN QUE TE FALTABA ---
const hashPassword = (password: string): string => {
  // 1. Genera el hash SHA256
  const hash = CryptoJS.SHA256(password);
  // 2. Convierte a Base64 (Para coincidir con C#)
  return hash.toString(CryptoJS.enc.Base64);
};

// --- FUNCIÓN DE REGISTRO ---
// --- FUNCIÓN DE REGISTRO ---
export const registerUser = async (userData: UserData): Promise<any> => {
  try {
    const payload = {
      username: userData.username,
      contraseña: userData.contraseña, 
      steamId: userData.steamId,
      pais: userData.pais,
      edad: Number(userData.edad),
      estiloJuego: userData.estiloJuego,
    };

    const targetUrl = `${BASE_URL}/CrearUsuario`; 

    console.error(`[API] Conectando a: ${targetUrl}`);
    console.error(`[API] Payload:`, JSON.stringify(payload, null, 2));

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json' 
      },
      body: JSON.stringify(payload),
    });

    console.error(`[API] Response status: ${response.status}`);

    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(`Server Error (${response.status}): ${responseText}`);
    }

    try {
      // Devolvemos los datos del usuario registrado
      return JSON.parse(responseText);
    } catch (e) {
      // Si la respuesta no es JSON, devolvemos un objeto con el mensaje
      return { message: responseText };
    }

  } catch (error: any) {
    console.error("API Fetch Error:", error);
    if (error.message && error.message.includes('Network request failed')) {
      throw new Error("Error de Conexión: Android bloqueó la petición HTTP.");
    }
    throw error;
  }
};
// --- FUNCIÓN DE LOGIN ---
export const loginUser = async (username: string, passwordInput: string): Promise<ApiUserResponse> => {
  try {
    // URL Final: http://teamfinderapiv2.somee.com/api/Usuarios/Login
    const targetUrl = `${BASE_URL}/Login`;
    
    console.log(`[Login] Conectando a: ${targetUrl}`);

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Username: username,
        Password: passwordInput 
      }),
    });

    if (!response.ok) {
      // Si es 401, es usuario o contraseña incorrectos
      if (response.status === 401) {
        throw new Error('Usuario o contraseña incorrectos');
      }
      const errorText = await response.text();
      throw new Error(errorText || 'Error al iniciar sesión');
    }

    const foundUser = await response.json();
    return foundUser;

  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};

export const loginWithSteam = async (steamId: string): Promise<UserData> => {
  try {
    console.error(`[Steam Login] Intentando login con SteamID: ${steamId}`);
    
    const response = await fetch(`${BASE_URL}/LoginSteam`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ steamId }),
    });

    console.error(`[Steam Login] Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Steam Login] Error response: ${errorText}`);
      throw new Error(errorText || 'Error al iniciar sesión con Steam');
    }

    const responseText = await response.text();
    console.error(`[Steam Login] Response text: ${responseText}`);

    // Si la respuesta está vacía, lanzar un error
    if (!responseText || responseText.trim() === '') {
      throw new Error('Respuesta vacía del servidor al iniciar sesión con Steam');
    }

    // Intentar parsear la respuesta como JSON
    try {
      return JSON.parse(responseText);
    } catch (e) {
      console.error('[Steam Login] Error al parsear JSON:', e);
      throw new Error('La respuesta del servidor no es un JSON válido');
    }
  } catch (error) {
    console.error("Error en Steam Login:", error);
    throw error;
  }
};

// --- OBTENER USUARIO POR ID ---
export const getUserById = async (id: number): Promise<UserData> => {
  try {
    const url = `${BASE_URL}/BuscarUsuarioEspecifico/${id}`;
    console.log(`[API] Buscando usuario: ${url}`);
    
    // Realizamos la petición
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error al obtener datos del usuario (${response.status})`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error en getUserById:", error);
    throw error;
  }
};

// EDITAR USUARIO ---
export const updateUser = async (id: number, data: any): Promise<boolean> => {
  try {
    const url = `${BASE_URL}/EditarUsuario/${id}`;
    console.log(`[API] Actualizando usuario: ${url}`, data);

    // El backend espera este JSON específico:
    // { "username", "steamId", "pais", "edad", "estiloJuego", "nuevaContraseña" }
    
    const response = await fetch(url, {
      method: 'PUT', // Usualmente editar es PUT, si falla prueba con POST
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Error al actualizar (${response.status})`);
    }

    return true; // Éxito
  } catch (error) {
    console.error("Error en updateUser:", error);
    throw error;
  }
};