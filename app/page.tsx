'use client';

import { Container } from '@/components/Layout';
import LatestGameResult from '@/components/LatestGameResult';
import LatestPendingSchedule from '@/components/LatestPendingSchedule';
import LatestMatchSchedule from '@/components/LatestMatchSchedule';
import StatsTable from '@/components/StatsTable';
import LatestGameRanking from '@/components/LatestGameRanking';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import CurrentPlayingGame from '@/components/CurrentPlayingGame';
import Skeleton from '@/components/common/Skeleton';

export default function Home() {
  const { data: session, status } = useSession();

  // 게임 데이터 로딩 상태 확인
  const { isLoading: gamesLoading } = useSWR('/api/games?status=game_done');

  // 현재 진행중인 게임 데이터와 로딩 상태
  const {
    data: playingGameResult,
    isLoading: playingGameLoading,
    mutate: mutatePlayingGame,
  } = useSWR('/api/games/latest?status=playing');

  if (status === 'loading' || gamesLoading || playingGameLoading) {
    return <Skeleton lines={3} cardHeight={120} />;
  }

  const userLevel = session?.user?.level ?? 0;

  if (userLevel < 1) {
    return (
      <Container>
        <div className="text-center py-20 text-lg text-gray-500">
          권한이 없습니다. 관리자에게 문의해주세요.
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="flex flex-col gap-8">
        {/* 현재 게임중 섹션 */}
        <CurrentPlayingGame
          data={playingGameResult}
          isLoading={playingGameLoading}
          mutate={mutatePlayingGame}
        />

        {/* 다음 게임 일정 섹션 */}
        <LatestPendingSchedule />

        {/* 진행예정게임대진 섹션 */}
        <LatestMatchSchedule />

        {/* 최근 게임 결과 섹션 */}
        <LatestGameResult />

        {/* 최근 게임 순위 섹션 */}
        <LatestGameRanking />

        {/* 통계 테이블 섹션 */}
        <StatsTable />
      </div>
    </Container>
  );
}
