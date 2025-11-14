import { Game, fetchTopGamesWithPlayers } from '@/components/api/steamApi';
import { useEffect, useState } from 'react';

export const useTopGames = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGames = async () => {
      try {
        setIsLoading(true);
        const topGames = await fetchTopGamesWithPlayers(); // Llamamos a la nueva función
        setGames(topGames);
        setError(null);
      } catch (err) {
        setError('No se pudieron cargar los juegos. Inténtalo de nuevo.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadGames();
  }, []);

  return { games, isLoading, error };
};