'use client';

import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useMemo, useState, useRef, useEffect } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { GameResult } from '@/model/gameResult';
// import MatchPrintPageContent from '@/components/MatchPrintPageContent';
import { getSchedule } from '@/service/schedule';
import { PrinterIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LatestMatchScheduleProps {
  isLoading?: boolean;
}

export default function LatestMatchSchedule({
  isLoading: externalLoading = false,
}: LatestMatchScheduleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldRestoreScroll, setShouldRestoreScroll] = useState(false);
  const savedScrollPosition = useRef<number>(0);
  // const [showPrint, setShowPrint] = useState(false);
  // const printRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 최신 match_done 게임 데이터를 가져오기
  const {
    data: gameResult,
    isLoading: gameLoading,
    error: gameError,
  } = useSWR<GameResult>('/api/games/latest?status=shared');

  // schedule 정보 fetch (attendees, courtNumbers 등)
  const { data: schedule, isLoading: scheduleLoading } = useSWR(
    gameResult?.scheduleID ? `/api/schedule/${gameResult.scheduleID}` : null,
    () => (gameResult ? getSchedule(gameResult.scheduleID) : undefined),
    { revalidateOnFocus: false }
  );

  const isLoading = externalLoading || gameLoading || scheduleLoading;

  const formattedDate = useMemo(() => {
    if (!gameResult?.date) return '';
    return format(new Date(gameResult.date), 'yy년MM월dd일(EEE)', {
      locale: ko,
    });
  }, [gameResult?.date]);

  useEffect(() => {
    if (!shouldRestoreScroll) return;

    const timer = setTimeout(() => {
      window.scrollTo({
        top: savedScrollPosition.current,
        behavior: 'smooth',
      });
      setShouldRestoreScroll(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [shouldRestoreScroll, isExpanded]);

  const handleToggleExpansion = () => {
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

  // 인쇄 핸들러
  // const handlePrint = () => {
  //   setShowPrint(true);
  //   setTimeout(() => {
  //     window.print();
  //     setShowPrint(false);
  //   }, 200);
  // };

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
          진행예정게임대진
        </h3>
        <div className="text-center py-8 text-red-500">
          데이터를 불러오는 중 오류가 발생했습니다.
        </div>
      </div>
    );
  }

  if (!gameResult) return null;

  const totalGames = gameResult.games.length;
  const displayedGames = isExpanded
    ? gameResult.games
    : gameResult.games.slice(0, 2);
  const hasMoreGames = totalGames > 2;

  return (
    <div>
      <div className="bg-white rounded-lg shadow-md p-4 print-hidden">
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">
            진행예정게임대진
          </h3>
          <div className="text-sm text-gray-600 text-right">
            {formattedDate}
            <br />
            {gameResult.courtName}
          </div>
        </div>
        {/* 각 게임별 상세 결과 */}
        <div className="space-y-3">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-semibold text-gray-700">
              게임별 대진 (총 {totalGames}게임)
            </div>
          </div>
          {displayedGames.map((game, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  게임 {index + 1}
                </span>
                <span className="text-sm text-gray-500">{game.time}</span>
              </div>
              <div className="flex justify-between gap-2 text-base">
                <div>
                  {game.players[0]}/{game.players[1]}
                </div>
                <div>vs</div>
                <div>
                  {game.players[2]}/{game.players[3]}
                </div>
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            {hasMoreGames && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleToggleExpansion}
                className="flex-1"
              >
                {isExpanded ? '접기' : `+${totalGames - 2}개의 게임 더보기`}
              </Button>
            )}
            {/* 대진표출력 버튼 */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              // onClick={handlePrint}
              onClick={() =>
                router.push(`/match/${gameResult.scheduleID}/print`)
              }
              className="flex-1"
              disabled={!schedule || scheduleLoading}
            >
              <PrinterIcon className="w-4 h-4" />
              대진표출력
            </Button>
          </div>
        </div>
      </div>
      {/* {showPrint && schedule && gameResult && (
        <div ref={printRef} className="print-area">
          <MatchPrintPageContent
            matchData={{
              games: gameResult.games,
              courtNumbers: schedule.courtNumbers,
              attendees: schedule.attendees,
              courtName: gameResult.courtName,
              date: typeof gameResult.date === 'string' ? gameResult.date : '',
            }}
          />
        </div>
      )} */}
    </div>
  );
}
