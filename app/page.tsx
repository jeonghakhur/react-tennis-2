'use client';

import { Container } from '@/components/Layout';
import LatestGameResult from '@/components/LatestGameResult';
import LatestPendingSchedule from '@/components/LatestPendingSchedule';
import LatestMatchSchedule from '@/components/LatestMatchSchedule';
import StatsTable from '@/components/StatsTable';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session } = useSession();
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

        {/* 통계 테이블 섹션 */}
        <div>
          <StatsTable />
        </div>
      </div>
    </Container>
  );
}
