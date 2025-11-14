// PEGA AQUÍ TU CLAVE DE LA API DE STEAM
export const STEAM_API_KEY = '57B686117C7D1F513EA81B8282424014';

export const STEAM_API_BASE_URL = 'https://api.steampowered.com';

// Endpoint para obtener el número de jugadores actuales de un juego específico
export const GET_PLAYER_COUNT_URL = (appid: number) => 
  `${STEAM_API_BASE_URL}/ISteamUserStats/GetNumberOfCurrentPlayers/v0001/?appid=${appid}&key=${STEAM_API_KEY}`;