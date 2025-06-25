// import { Match } from "@/model/match";

import { GameResult, Game, GameComment } from '@/model/gameResult';
import useSWR, { useSWRConfig } from 'swr';

async function deleteGame(scheduleId: string) {
  return fetch(`/api/games/${scheduleId}`, {
    method: 'DELETE',
  }).then((res) => res.json());
}

async function updateGame(
  gameId: string,
  matches: Game[],
  status?: GameResult['status'],
  editor?: GameResult['lastEditor']
) {
  return fetch(`/api/games/${gameId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ matches, status, editor }),
  }).then(async (res) => {
    if (!res.ok) {
      let errorMsg = 'Unknown error';
      try {
        const text = await res.text();
        try {
          const err = JSON.parse(text);
          errorMsg = err?.error || text;
        } catch {
          errorMsg = text;
        }
      } catch {
        // 완전히 실패하면 그대로
      }
      throw new Error(errorMsg);
    }
    return res.json();
  });
}

async function addCommentToGameResult(
  gameResultId: string,
  comment: GameComment
) {
  console.log('📤 게임 결과 코멘트 추가 요청:', { gameResultId, comment });

  try {
    const response = await fetch(`/api/gameResult/${gameResultId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ 게임 결과 코멘트 추가 실패:', errorData);
      throw new Error(
        errorData.error || '게임 결과 코멘트 추가에 실패했습니다.'
      );
    }

    const result = await response.json();
    console.log('✅ 게임 결과 코멘트 추가 성공:', result);
    return result;
  } catch (error) {
    console.error('❌ 게임 결과 코멘트 추가 중 에러:', error);
    throw error;
  }
}

async function removeCommentFromGameResult(
  gameResultId: string,
  commentKey: string
) {
  console.log('🗑️ 게임 결과 코멘트 삭제 요청:', { gameResultId, commentKey });

  try {
    const response = await fetch(`/api/gameResult/${gameResultId}/comments`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentKey }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ 게임 결과 코멘트 삭제 실패:', errorData);
      throw new Error(
        errorData.error || '게임 결과 코멘트 삭제에 실패했습니다.'
      );
    }

    const result = await response.json();
    console.log('✅ 게임 결과 코멘트 삭제 성공:', result);
    return result;
  } catch (error) {
    console.error('❌ 게임 결과 코멘트 삭제 중 에러:', error);
    throw error;
  }
}

export default function useGame(scheduleId: string) {
  const {
    data: game,
    isLoading,
    error,
    mutate,
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

  const updateGameData = async (
    id: string,
    matches: Game[],
    status?: GameResult['status'],
    editor?: GameResult['lastEditor']
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      await updateGame(id, matches, status, editor);
      globalMutate(`/api/games/${id}`, undefined, { revalidate: true });
      globalMutate('/api/games', undefined, { revalidate: true });
      return { success: true };
    } catch (error) {
      console.error('게임 업데이트 중 오류:', error);
      return { success: false, error: '게임 업데이트 중 오류가 발생했습니다.' };
    }
  };

  const addComment = async (comment: GameComment) => {
    if (!game) return;

    const newComments = [...(game.comments || []), comment];
    const newGame = { ...game, comments: newComments } as GameResult;

    return mutate(
      async () => {
        await addCommentToGameResult(game._id!, comment);
        // 코멘트만 업데이트하고 전체 데이터는 다시 가져오지 않음
        return { ...game, comments: newComments };
      },
      {
        optimisticData: newGame,
        rollbackOnError: true,
        populateCache: true,
        revalidate: false,
      }
    );
  };

  const removeComment = async (commentKey: string) => {
    if (!game) return;

    const updatedComments = (game.comments || []).filter(
      (comment: GameComment) => comment._key !== commentKey
    );
    const newGame = { ...game, comments: updatedComments } as GameResult;

    return mutate(
      async () => {
        await removeCommentFromGameResult(game._id!, commentKey);
        // 코멘트만 업데이트하고 전체 데이터는 다시 가져오지 않음
        return { ...game, comments: updatedComments };
      },
      {
        optimisticData: newGame,
        rollbackOnError: true,
        populateCache: true,
        revalidate: false,
      }
    );
  };

  return {
    game,
    isLoading,
    error,
    removeGame,
    updateGameData,
    addComment,
    removeComment,
  };
}
