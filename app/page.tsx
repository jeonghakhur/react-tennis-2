'use client';

import { Container } from '@/components/Layout';
import LatestGameResult from '@/components/LatestGameResult';
import LatestPendingSchedule from '@/components/LatestPendingSchedule';
import LatestMatchSchedule from '@/components/LatestMatchSchedule';
import StatsTable from '@/components/StatsTable';
import LatestGameRanking from '@/components/LatestGameRanking';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';

// 스켈레톤 컴포넌트
function HomeSkeleton() {
  return (
    <Container>
      <div className="flex flex-col gap-8">
        {/* 다음 게임 일정 스켈레톤 */}
        <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>

        {/* 진행예정게임대진 스켈레톤 */}
        <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>

        {/* 최근 게임 결과 스켈레톤 */}
        <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>

        {/* 최근 게임 순위 스켈레톤 */}
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>

        {/* 통계 테이블 스켈레톤 */}
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

export default function Home() {
  const { data: session, status } = useSession();

  // 게임 데이터 로딩 상태 확인
  const { isLoading: gamesLoading } = useSWR('/api/games?status=game_done');

  // 세션 로딩 중이거나 게임 데이터 로딩 중일 때 스켈레톤 표시
  if (status === 'loading' || gamesLoading) {
    return <HomeSkeleton />;
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
        {/* 다음 게임 일정 섹션 */}
        <LatestPendingSchedule />

        {/* 진행예정게임대진 섹션 */}
        <div>
          <LatestMatchSchedule />
        </div>

        {/* 최근 게임 결과 섹션 */}
        <div>
          <LatestGameResult />
        </div>

        {/* 최근 게임 순위 섹션 */}
        <div>
          <LatestGameRanking />
        </div>

        {/* 통계 테이블 섹션 */}
        <div>
          <StatsTable />
        </div>
      </div>
    </Container>
  );
}
