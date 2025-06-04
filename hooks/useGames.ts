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
  } = useSWR<GameResult>(`/api/games/${scheduleId}`, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
  const { mutate: globalMutate } = useSWRConfig();

  const removeGame = async (
    id: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // 1. 현재 게임 목록 데이터 가져오기
      const currentGames = await globalMutate('/api/games');

      if (!currentGames) {
        // 데이터가 없으면 바로 서버에서 삭제 후 갱신
        await deleteGame(id);
        await globalMutate('/api/games', undefined, { revalidate: true });
        return { success: true };
      }

      // 2. Optimistic update: 삭제될 게임을 제외한 목록으로 즉시 업데이트
      const filteredGames = currentGames.filter(
        (game: GameResult) => game._id !== id
      );
      globalMutate('/api/games', filteredGames, { revalidate: false });

      // 3. 서버에서 실제 삭제
      await deleteGame(id);

      // 4. 삭제 완료 후 서버에서 최신 데이터 다시 가져오기 (백그라운드에서)
      globalMutate('/api/games', undefined, { revalidate: true });

      return { success: true };
    } catch (error) {
      console.error('게임 삭제 중 오류:', error);
      // 에러 발생 시 원래 데이터로 복구
      await globalMutate('/api/games');
      return { success: false, error: '게임 삭제 중 오류가 발생했습니다.' };
    }
  };

  return {
    game,
    isLoading,
    error,
    removeGame,
  };
}
