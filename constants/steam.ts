// PEGA AQUÍ TU CLAVE DE LA API DE STEAM
export const STEAM_API_KEY = '57B686117C7D1F513EA81B8282424014';

export const STEAM_API_BASE_URL = 'https://api.steampowered.com';

// Mapeo de códigos de país a nombres completos
const COUNTRY_MAP: { [key: string]: string } = {
  MX: "México", AR: "Argentina", CL: "Chile", CO: "Colombia",
  ES: "España", PE: "Perú", US: "Estados Unidos", BR: "Brasil", UY: "Uruguay"
};
// Endpoint para obtener el número de jugadores actuales de un juego específico
export const GET_PLAYER_COUNT_URL = (appid: number) => 
  `${STEAM_API_BASE_URL}/ISteamUserStats/GetNumberOfCurrentPlayers/v0001/?appid=${appid}&key=${STEAM_API_KEY}`;


export const GET_PLAYER_SUMMARY_URL = (steamids: string) => 
  `${STEAM_API_BASE_URL}/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamids}`;


export const fetchSteamUserData = async (steamId: string) => {
  try {
    const response = await fetch(GET_PLAYER_SUMMARY_URL(steamId));
    const data = await response.json();
    
    const player = data.response?.players?.[0];

    if (!player) return null;

    // Mapear el código de país (ej: 'MX') al nombre en tu lista ('México')
    // Si no existe o no tiene país público, retornamos "Otro" o vacío.
    let paisNombre = "Otro";
    if (player.loccountrycode && COUNTRY_MAP[player.loccountrycode]) {
      paisNombre = COUNTRY_MAP[player.loccountrycode];
    } else if (player.loccountrycode) {
      // Si tiene país pero no está en tu lista principal
      paisNombre = "Otro";
    }

    return {
      steamId: player.steamid,
      pais: paisNombre,
      avatar: player.avatarfull, // Extra: por si quieres guardar la foto
      personaname: player.personaname // Extra: nombre de usuario en steam
    };
  } catch (error) {
    console.error("Error fetching Steam data", error);
    throw error;
  }
};