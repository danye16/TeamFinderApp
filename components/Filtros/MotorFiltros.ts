import { PlayerMatch } from '../services/userGame.service';

// --- 1. LA INTERFAZ (Component) ---
export interface IFiltroJugador {
    filtrar(jugadores: PlayerMatch[]): PlayerMatch[];
}

// --- 2. EL COMPUESTO (Composite) ---
export class FiltroCompuestoY implements IFiltroJugador {
    private filtros: IFiltroJugador[] = [];

    agregar(filtro: IFiltroJugador): void {
        this.filtros.push(filtro);
    }

    filtrar(jugadores: PlayerMatch[]): PlayerMatch[] {
        let resultado = jugadores;
        // El patrón recorre sus hijos y aplica cada filtro
        for (const filtro of this.filtros) {
            resultado = filtro.filtrar(resultado);
        }
        return resultado;
    }
}

// --- 3. LAS HOJAS (Leafs) - Reglas específicas ---

// Regla: Estilo de Juego
export class FiltroEstilo implements IFiltroJugador {
    constructor(private estilo: string) {}

    filtrar(jugadores: PlayerMatch[]): PlayerMatch[] {
        if (!this.estilo) return jugadores;
        return jugadores.filter(j => j.usuarioEstiloJuego === this.estilo);
    }
}

// Regla: Excluirse a uno mismo
export class FiltroExcluirPropio implements IFiltroJugador {
    constructor(private miId: number) {}

    filtrar(jugadores: PlayerMatch[]): PlayerMatch[] {
        return jugadores.filter(j => j.usuarioId !== this.miId);
    }
}

// Regla: Eliminar duplicados
export class FiltroUsuarioUnico implements IFiltroJugador {
    filtrar(jugadores: PlayerMatch[]): PlayerMatch[] {
        const vistos = new Set();
        return jugadores.filter(j => {
            const esDuplicado = vistos.has(j.usuarioId);
            vistos.add(j.usuarioId);
            return !esDuplicado;
        });
    }
}