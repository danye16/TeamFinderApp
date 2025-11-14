import { GET_PLAYER_COUNT_URL } from '@/constants/steam';

// 1. Actualizamos la interfaz para incluir el número de jugadores
export interface Game {
  appid: number;
  name: string;
  coverUrl: string;
  playerCount: number;
}

// 2. Lista predefinida de juegos populares con sus AppIDs
const POPULAR_GAMES = [
  { name: 'Counter-Strike 2', appid: 730 },
  { name: 'DOTA 2', appid: 570 },
  { name: 'PUBG: BATTLEGROUNDS', appid: 578080 },
  { name: 'Apex Legends', appid: 1172470 },
  { name: 'GTA V', appid: 271590 },
  { name: 'Baldur\'s Gate 3', appid: 1086940 },
  { name: 'Team Fortress 2', appid: 440 },
  { name: 'Rust', appid: 252490 },
  { name: 'Red Dead Redemption 2', appid: 1174180 },
  { name: 'Warframe', appid: 230410 },
  { name: 'Elden Ring', appid: 1245620 },
  { name: 'Cyberpunk 2077', appid: 1091500 },
  { name: 'Left 4 Dead 2', appid: 550 },
  { name: 'The Witcher 3: Wild Hunt', appid: 292030 },
  { name: 'Stardew Valley', appid: 413150 },
  { name: 'Terraria', appid: 105600 },
  { name: 'Minecraft', appid: 238960 }, 
  { name: 'Fall Guys', appid: 1097150 },
  { name: 'Rocket League', appid: 252950 },
  { name: 'Ark: Survival Evolved', appid: 346110 },
];

/**
 * Obtiene el número de jugadores actuales para una lista predefinida de juegos populares,
 * los ordena y devuelve el top.
 * @returns {Promise<Game[]>} - Una promesa que resuelve a un array de juegos ordenados.
 */
export const fetchTopGamesWithPlayers = async (): Promise<Game[]> => {
  try {
    // 3. Usamos Promise.all para hacer todas las llamadas a la API en paralelo
    const gamePromises = POPULAR_GAMES.map(async (game) => {
      const response = await fetch(GET_PLAYER_COUNT_URL(game.appid));
      const data = await response.json();
      const playerCount = data.response?.player_count || 0;

      return {
        appid: game.appid,
        name: game.name,
        playerCount: playerCount,
        coverUrl: `https://steamcdn-a.akamaihd.net/steam/apps/${game.appid}/header.jpg`,
      };
    });

    const gamesWithPlayerCount = await Promise.all(gamePromises);

    // 4. Ordenamos la lista de mayor a menor número de jugadores
    const sortedGames = gamesWithPlayerCount.sort((a, b) => b.playerCount - a.playerCount);

    return sortedGames;
  } catch (error) {
    console.error("Error al obtener los datos de jugadores de Steam:", error);
    return []; 
  }
};