// components/services/matching.service.ts

const BASE_URL = 'https://teamfinderapiv2.somee.com/api';

// Usamos una interfaz unificada que sirva para todo
export interface MatchDetalle {
    id: number;
    // La API devuelve objetos anidados, así que los definimos aquí
    usuario1: { id: number; username: string; avatarUrl?: string; pais?: string };
    usuario2: { id: number; username: string; avatarUrl?: string; pais?: string };
    juego: { id: number; nombre: string; imagenUrl?: string };
    matchConfirmado: boolean;
    aceptadoPorUsuario1: boolean;
    aceptadoPorUsuario2: boolean;
    fechaMatch?: string;
}

export const matchingService = {
    
    // --- 1. Obtener TODOS los matches (Pendientes + Confirmados) ---
    // Esta es la función clave que arregla el chat
    async getMyMatches(usuarioId: number): Promise<MatchDetalle[]> {
        try {
            console.log(`[MATCHING_SERVICE] Buscando matches para ID: ${usuarioId}`);
            
            // Hacemos las dos peticiones en paralelo para ser más rápidos
            const [resPendientes, resConfirmados] = await Promise.all([
                fetch(`${BASE_URL}/Matches/Pendientes/${usuarioId}`),
                fetch(`${BASE_URL}/Matches/Confirmados/${usuarioId}`)
            ]);

            let pendientes: MatchDetalle[] = [];
            let confirmados: MatchDetalle[] = [];

            if (resPendientes.ok) {
                pendientes = await resPendientes.json();
            }
            
            if (resConfirmados.ok) {
                confirmados = await resConfirmados.json();
            }

            // Unimos las dos listas en una sola
            const totalMatches = [...pendientes, ...confirmados];
            console.log(`[MATCHING_SERVICE] Total encontrados: ${totalMatches.length} (${pendientes.length} pendientes, ${confirmados.length} confirmados)`);
            
            return totalMatches;

        } catch (error) {
            console.error('[MATCHING_SERVICE] Error obteniendo matches:', error);
            return [];
        }
    },

    // --- 2. Crear Match ---
    async crearMatch(usuario1Id: number, usuario2Id: number, juegoId: number) {
        try {
            const response = await fetch(`${BASE_URL}/Matches/CrearMatch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario1Id, usuario2Id, juegoId }),
            });

            if (!response.ok) {
                // Si ya existe o hay error, a veces devuelve texto
                const errorText = await response.text(); 
                console.warn("Info API:", errorText);
                return null;
            }
            return await response.json();
        } catch (error) {
            console.error('Error al crear match:', error);
            return null;
        }
    },

    // --- 3. Aceptar Match ---
    async aceptarMatch(matchId: number, usuarioId: number) {
        try {
            const response = await fetch(`${BASE_URL}/Matches/AceptarMatch/${matchId}/${usuarioId}`, {
                method: 'PUT',
            });
            return response.ok;
        } catch (error) {
            console.error('Error al aceptar match:', error);
            return false;
        }
    },

    // --- 4. Rechazar Match ---
    async rechazarMatch(matchId: number, usuarioId: number) {
        try {
            const response = await fetch(`${BASE_URL}/Matches/RechazarMatch/${matchId}/${usuarioId}`, {
                method: 'DELETE',
            });
            return response.ok;
        } catch (error) {
            console.error('Error al rechazar match:', error);
            return false;
        }
    }
};