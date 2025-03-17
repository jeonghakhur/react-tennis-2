// import { Match } from "@/model/match";

import { GameResult } from '@/model/gameResult';
import useSWR, { useSWRConfig } from 'swr';

async function deleteGame(scheduleId: string) {
  return fetch(`/api/games/${scheduleId}`, {
    method: 'DELETE',
  }).then((res) => res.json());
}

export default function useGame(scheduleId: string) {
  const {
    data: game,
    isLoading,
    error,
    // mutate,
  } = useSWR<GameResult>(`/api/games/${scheduleId}`, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
  const { mutate: globalMutate } = useSWRConfig();

  const removeGame = async (id: string) => {
    const currentGames = await globalMutate('/api/games');

    globalMutate(
      '/api/games',
      currentGames?.filter((game: GameResult) => game._id !== id),
      { revalidate: false }
    );
    await deleteGame(id);

    globalMutate('/api/games');
  };

  return {
    game,
    isLoading,
    error,
    removeGame,
  };
}
