// components/services/matching.service.ts

const BASE_URL = 'https://teamfinderapiv2.somee.com/api';

// Interfaces específicas de Matching
export interface MatchStatus {
    id: number;
    matchConfirmado: boolean;
    aceptadoPorUsuario1: boolean;
    aceptadoPorUsuario2: boolean;
    usuario1Id: number;
    usuario2Id: number;
    
}

export interface MatchDetalle {
    id: number;
    usuario1: { id: number; username: string; avatarUrl?: string };
    usuario2: { id: number; username: string; avatarUrl?: string };
    juego: { id: number; nombre: string; imagenUrl?: string };
    matchConfirmado: boolean;
    aceptadoPorUsuario1: boolean;
    aceptadoPorUsuario2: boolean;
}

export const matchingService = {
    // 1. Crear Match (o recuperar existente)
    async crearMatch(usuario1Id: number, usuario2Id: number, juegoId: number) {
        try {
            const response = await fetch(`${BASE_URL}/Matches/CrearMatch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario1Id, usuario2Id, juegoId }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.warn("Advertencia al crear/recuperar match:", errorText);
                // Si el backend devuelve texto plano por error, retornamos null
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error('Error al crear match:', error);
            return null;
        }
    },

    // 2. Aceptar Match
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

    // 3. Rechazar Match
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
    },

    // 4. Obtener Pendientes
    async obtenerPendientes(usuarioId: number) {
        try {
            const response = await fetch(`${BASE_URL}/Matches/Pendientes/${usuarioId}`);
            if (!response.ok) return [];
            return await response.json() as MatchDetalle[];
        } catch (error) {
            console.error('Error fetching pendientes:', error);
            return [];
        }
    },

    // 5. Obtener Confirmados
    async obtenerConfirmados(usuarioId: number) {
        try {
            const response = await fetch(`${BASE_URL}/Matches/Confirmados/${usuarioId}`);
            if (!response.ok) return [];
            return await response.json() as MatchDetalle[];
        } catch (error) {
            console.error('Error fetching confirmados:', error);
            return [];
        }
    }
};