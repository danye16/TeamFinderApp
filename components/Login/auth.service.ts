import AsyncStorage from '@react-native-async-storage/async-storage';

// Definición de tipos
export interface UserData {
  username: string;
  contraseña?: string; 
  password?: string;
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

const API_URL = 'http://teamfinderapiv2.somee.com/api/Usuarios';

// --- FUNCIÓN DE REGISTRO ---
export const registerUser = async (userData: UserData): Promise<any> => {
  try {
    // 1. Preparar datos (Mapeo exacto para tu API C#)
    const payload = {
      username: userData.username,
      contraseña: userData.password, // Mapeamos password -> contraseña
      steamId: userData.steamId,
      pais: userData.pais,
      edad: Number(userData.edad),   // Aseguramos número
      estiloJuego: userData.estiloJuego,
    };

    console.log("API Request [POST]:", JSON.stringify(payload));

    // 2. Hacer la petición
    const response = await fetch(`${API_URL}/CrearUsuario`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json' 
      },
      body: JSON.stringify(payload),
    });

    // 3. Analizar la respuesta RAW (Texto crudo antes de JSON)
    const responseText = await response.text();
    console.log(`API Status: ${response.status}`);
    console.log(`API Response Body: ${responseText}`);

    if (!response.ok) {
      // Si el servidor dio error (400, 500), lanzamos el texto que nos devolvió
      throw new Error(`Server Error (${response.status}): ${responseText}`);
    }

    // 4. Intentar parsear JSON solo si todo salió bien
    try {
      return JSON.parse(responseText);
    } catch (e) {
      // A veces la API devuelve texto plano "Usuario creado" en lugar de JSON
      return { message: responseText };
    }

  } catch (error: any) {
    console.error("API Fetch Error:", error);
    
    // Detectar error de bloqueo HTTP en Android
    if (error.message && error.message.includes('Network request failed')) {
      throw new Error("Error de Conexión: Android bloqueó la petición HTTP. \n\nSolución: Agrega android:usesCleartextTraffic=\"true\" en AndroidManifest.xml");
    }
    
    throw error;
  }
};

// --- FUNCIÓN DE LOGIN (Simple, sin hash del cliente por ahora para probar) ---
export const loginUser = async (username: string, passwordInput: string): Promise<ApiUserResponse> => {
  try {
    console.log("API Request [GET]: MostrarUsuarios");
    const response = await fetch(`${API_URL}/MostrarUsuarios`);
    
    if (!response.ok) {
      throw new Error('No se pudo conectar con el servidor');
    }

    const users: ApiUserResponse[] = await response.json();

    // Buscamos al usuario (Fitrado en cliente)
    const foundUser = users.find(u => 
      u.username.toLowerCase() === username.toLowerCase() && 
      (u.contraseña === passwordInput || u.username === username) // Login simple para test
    );

    if (!foundUser) {
      throw new Error('Usuario o contraseña incorrectos');
    }

    return foundUser;
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};