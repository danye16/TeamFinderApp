// components/services/events.service.ts

export interface EventoDto {
  id: number;
  titulo: string;
  descripcion: string;
  juegoNombre: string;       // Viene de tu DTO en C#
  organizadorUsername: string; // Viene de tu DTO en C#
  fechaInicio: string;
  maxParticipantes: number;
  cantidadParticipantes: number;
  imagenUrl?: string;
  tieneCuposDisponibles: boolean;
}

const BASE_URL = 'https://teamfinderapiv2.somee.com/api/EventosGaming';

export const getAllEvents = async (): Promise<EventoDto[]> => {
  try {
    const response = await fetch(`${BASE_URL}/MostrarTodos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener los eventos');
    }

    return await response.json();
  } catch (error) {
    console.error("Error en getAllEvents:", error);
    throw error; // Propagamos el error para manejarlo en la vista
  }
};