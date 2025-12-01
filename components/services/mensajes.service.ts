// components/services/mensajes.service.ts

const BASE_URL = 'https://teamfinderapiv2.somee.com/api';

export interface Mensaje {
    id: number;
    contenido: string;
    remitenteId: number;
    fechaEnvio: string;
    leido: boolean;
}

export const mensajesService = {
    // 1. Obtener Conversación
    async obtenerConversacion(usuario1Id: number, usuario2Id: number) {
        try {
            const response = await fetch(`${BASE_URL}/Mensajes/Conversacion/${usuario1Id}/${usuario2Id}`);
            if (!response.ok) return [];
            return await response.json();
        } catch (error) {
            console.error('Error obteniendo conversación:', error);
            return [];
        }
    },

    // 2. Enviar Mensaje
    async enviarMensaje(remitenteId: number, destinatarioId: number, contenido: string) {
        try {
            const response = await fetch(`${BASE_URL}/Mensajes/EnviarMensaje`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ remitenteId, destinatarioId, contenido }),
            });

            // Manejo de errores específicos (403 Forbidden)
            if (response.status === 403) {
                const errorText = await response.text();
                throw new Error(errorText || "No puedes responder hasta aceptar el match.");
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Error al enviar mensaje.");
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }
};