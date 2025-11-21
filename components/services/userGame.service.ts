import { Game } from '@/components/api/steamApi';

// Ajusta tu URL base
const BASE_URL = 'http://teamfinderapiv2.somee.com/api';

// Interfaz de tu tabla Juegos (según tu imagen)
interface LocalGame {
  id: number; // ID interno de tu BD
  nombre: string;
  categoria: string;
  imagenUrl: string;
  steamAppId: number;
}

export interface PlayerMatch {
  id: number;
  usuarioId: number;
  username: string;
  estiloJuego?: string;
  
}

// --- FUNCIÓN PRINCIPAL: ORQUESTADOR ---
export const addGameToUser = async (userId: number, steamGame: Game) => {
  try {
    // PASO 1: Verificar si el juego ya existe en tu BD local
    let localGameId = await getLocalGameId(steamGame.appid);

    // PASO 2: Si no existe, lo creamos
    if (!localGameId) {
      console.log(`[API] El juego ${steamGame.name} no existe localmente. Creando...`);
      localGameId = await createLocalGame(steamGame);
    }

    if (!localGameId) {
      throw new Error("No se pudo obtener ni crear el ID del juego local.");
    }

    console.log(`[API] Juego listo para vincular. ID Local: ${localGameId}`);

    // PASO 3: Crear la relación Usuario-Juego
    // CORRECCIÓN IMPORTANTE AQUÍ:
    // Usamos 'juegoId' con el ID local (ej: 4) que acabamos de obtener.
    const payload = {
      usuarioId: userId,
      juegoId: localGameId, // <--- CAMBIO CLAVE: Usamos el ID de TU base de datos
      // Mantenemos estos por si acaso tu backend los usa para logs o validación extra
      steamAppId: steamGame.appid, 
      nombre: steamGame.name,
      categoria: "Videojuego",
      imagenUrl: steamGame.coverUrl
    };

    console.log("[API] Vinculando usuario con juego:", JSON.stringify(payload));

    const response = await fetch(`${BASE_URL}/UsuarioJuegos/CrearUsuarioJuego`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Si el backend devuelve error, lo mostramos para depurar
      console.warn("Advertencia al vincular:", errorText);
    } else {
      console.log("¡Vinculación exitosa!");
    }
    return true;

  } catch (error) {
    console.error("Error en el flujo addGameToUser:", error);
    return false;
  }
};

// --- HELPER: BUSCAR JUEGO LOCAL ---
const getLocalGameId = async (steamAppId: number): Promise<number | null> => {
  try {
    const response = await fetch(`${BASE_URL}/Juegos/BuscarPorSteamId/${steamAppId}`);
    if (response.ok) {
      const data: LocalGame = await response.json();
      return data.id;
    }
    return null; // 404 Not Found o similar
  } catch (error) {
    return null;
  }
};

// --- HELPER: CREAR JUEGO LOCAL ---
const createLocalGame = async (game: Game): Promise<number | null> => {
  try {
    const payload = {
      nombre: game.name,
      categoria: "Videojuego", // Valor por defecto
      imagenUrl: game.coverUrl,
      steamAppId: game.appid
    };

    const response = await fetch(`${BASE_URL}/Juegos/CrearJuego`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const newGame: LocalGame = await response.json();
      return newGame.id;
    } else {
        console.error("Fallo al crear juego local:", await response.text());
        return null;
    }
  } catch (error) {
    console.error("Error creando juego local:", error);
    return null;
  }
};

// 2. OBTENER JUGADORES (GET)
// Este se mantiene igual, llamando a tu endpoint específico de búsqueda
export const getPlayersByGame = async (steamAppId: number): Promise<PlayerMatch[]> => {
  try {
    const url = `${BASE_URL}/UsuarioJuegos/BuscarUsuarioJuegoEspecifico/${steamAppId}`;
    const response = await fetch(url);
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return Array.isArray(data) ? data : [data]; 
  } catch (error) {
    return [];
  }
};