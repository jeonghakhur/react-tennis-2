'use client';

import { GameResult } from '@/model/gameResult';
import { Button } from '@/components/ui/button';
import { useMemo, useState, useRef, useEffect } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface LatestGameResultProps {
  isLoading?: boolean;
}

export default function LatestGameResult({
  isLoading: externalLoading = false,
}: LatestGameResultProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldRestoreScroll, setShouldRestoreScroll] = useState(false);
  const savedScrollPosition = useRef<number>(0);
  const router = useRouter();

  // 최신 게임 데이터를 직접 가져오기
  const {
    data: gameResult,
    isLoading: gameLoading,
    error: gameError,
  } = useSWR<GameResult>('/api/games/latest');

  const isLoading = externalLoading || gameLoading;

  const formattedDate = useMemo(() => {
    if (!gameResult?.date) return '';
    return format(new Date(gameResult.date), 'yyyy년 MM월 dd일 (EEE)', {
      locale: ko,
    });
  }, [gameResult?.date]);

  // 스크롤 위치 복원을 위한 useEffect
  useEffect(() => {
    if (shouldRestoreScroll) {
      // DOM 업데이트 후 스크롤 위치 복원
      const timer = setTimeout(() => {
        window.scrollTo({
          top: savedScrollPosition.current,
          behavior: 'smooth',
        });
        setShouldRestoreScroll(false);
      }, 100); // DOM 업데이트를 위한 충분한 시간

      return () => clearTimeout(timer);
    }
  }, [shouldRestoreScroll, isExpanded]);

  const handleToggleExpansion = () => {
    console.log('handleToggleExpansion', isExpanded, window.scrollY);
    if (isExpanded) {
      // 접기 버튼 클릭 시 더보기를 누른 시점의 스크롤 위치로 복원
      setIsExpanded(false);
      setShouldRestoreScroll(true);
    } else {
      // 더보기 버튼 클릭 시 현재 스크롤 위치 저장
      savedScrollPosition.current = window.scrollY;
      setIsExpanded(true);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (gameError) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          최근 게임 결과
        </h3>
        <div className="text-center py-8 text-red-500">
          데이터를 불러오는 중 오류가 발생했습니다.
        </div>
      </div>
    );
  }

  if (!gameResult) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          최근 게임 결과
        </h3>
        <div className="text-center py-8 text-gray-500">
          아직 완료된 게임이 없습니다.
        </div>
      </div>
    );
  }

  const totalGames = gameResult.games.length;
  const displayedGames = isExpanded
    ? gameResult.games
    : gameResult.games.slice(0, 2);
  const hasMoreGames = totalGames > 2;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">최근게임결과</h3>
        <div className="text-sm text-gray-600">
          {formattedDate} • {gameResult.courtName}
        </div>
      </div>

      {/* 각 게임별 상세 결과 */}
      <div className="space-y-3">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm font-semibold text-gray-700">
            게임별 결과 (총 {totalGames}게임)
          </div>
          {gameResult && (
            <button
              onClick={() => router.push(`/games/${gameResult.scheduleID}`)}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              상세보기
            </button>
          )}
        </div>
        {displayedGames.map((game, index) => {
          const scoreA = parseInt(game.score[0] || '0') || 0;
          const scoreB = parseInt(game.score[1] || '0') || 0;
          const teamAWins = scoreA > scoreB;
          const teamBWins = scoreB > scoreA;

          return (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  게임 {index + 1}
                </span>
                <span className="text-sm text-gray-500">{game.time}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-xs text-gray-500 mb-1">페어 A</div>
                  <div className={`text-sm ${teamAWins ? 'font-bold' : ''}`}>
                    {game.players[0]}, {game.players[1]}
                    <span
                      className={`ml-1 ${teamAWins ? 'text-red-600 font-bold' : 'text-gray-700'}`}
                    >
                      [{game.score[0] || '0'}]
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">페어 B</div>
                  <div className={`text-sm ${teamBWins ? 'font-bold' : ''}`}>
                    {game.players[2]}, {game.players[3]}
                    <span
                      className={`ml-1 ${teamBWins ? 'text-red-600 font-bold' : 'text-gray-700'}`}
                    >
                      [{game.score[1] || '0'}]
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 더보기 버튼 */}
      {hasMoreGames && (
        <div className="mt-4 text-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleToggleExpansion}
            className="text-sm"
          >
            {isExpanded ? '접기' : `+${totalGames - 2}개의 게임 더보기`}
          </Button>
        </div>
      )}
    </div>
  );
}
