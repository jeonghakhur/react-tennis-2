'use client';

import { GameResult } from '@/model/gameResult';
import LoadingGrid from '@/components/LoadingGrid';
import useSWR from 'swr';
import { useMemo, useState } from 'react';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { UserProps } from '@/model/user';

type PlayerStats = {
  name: string;
  win: number;
  draw: number;
  lose: number;
  game: number;
  point: number;
  winRate: number;
  score: number;
  loseScore: number;
  margin: number;
};

function calculateStats(games: GameResult[]): PlayerStats[] {
  const stats: Record<string, PlayerStats> = {};

  games.forEach((gameResult) => {
    gameResult.games.forEach((game) => {
      // 2:2 경기 기준
      const [scoreA = 0, scoreB = 0] = game.score.map(Number);
      const teamA = [game.players[0], game.players[1]].filter(
        (p): p is string => !!p
      );
      const teamB = [game.players[2], game.players[3]].filter(
        (p): p is string => !!p
      );

      teamA.forEach((name: string) => {
        if (!stats[name]) {
          stats[name] = {
            name,
            win: 0,
            draw: 0,
            lose: 0,
            game: 0,
            point: 0,
            winRate: 0,
            score: 0,
            loseScore: 0,
            margin: 0,
          };
        }
        stats[name].game += 1;
        stats[name].score += scoreA;
        stats[name].loseScore += scoreB;
        stats[name].margin += scoreA - scoreB;
        if (scoreA > scoreB) {
          stats[name].win += 1;
          stats[name].point += 3;
        } else if (scoreA === scoreB) {
          stats[name].draw += 1;
          stats[name].point += 1;
        } else {
          stats[name].lose += 1;
        }
      });

      teamB.forEach((name: string) => {
        if (!stats[name]) {
          stats[name] = {
            name,
            win: 0,
            draw: 0,
            lose: 0,
            game: 0,
            point: 0,
            winRate: 0,
            score: 0,
            loseScore: 0,
            margin: 0,
          };
        }
        stats[name].game += 1;
        stats[name].score += scoreB;
        stats[name].loseScore += scoreA;
        stats[name].margin += scoreB - scoreA;
        if (scoreB > scoreA) {
          stats[name].win += 1;
          stats[name].point += 3;
        } else if (scoreB === scoreA) {
          stats[name].draw += 1;
          stats[name].point += 1;
        } else {
          stats[name].lose += 1;
        }
      });
    });
  });

  // 승률 계산
  Object.values(stats).forEach((s) => {
    s.winRate = s.game > 0 ? s.win / s.game : 0;
  });

  // 정렬: 승점 → 승률 → 마진
  return Object.values(stats).sort(
    (a, b) => b.point - a.point || b.winRate - a.winRate || b.margin - a.margin
  );
}

function StatsTableContent({ stats }: { stats: PlayerStats[] }) {
  const [showAll, setShowAll] = useState(false);
  const displayStats = showAll ? stats : stats.slice(0, 10);
  const router = useRouter();

  // 가장 많은 게임 수 찾기
  const maxGames = Math.max(...stats.map((s) => s.game));
  const minGamesThreshold = Math.ceil(maxGames * 0.33);

  // 33% 이상 참석한 회원들만 필터링
  const qualifiedPlayers = stats.filter((s) => s.game >= minGamesThreshold);

  // 각 항목별 상위 2명 찾기 (33% 이상 참석한 회원들 중에서)
  const sortedByPoint = [...qualifiedPlayers].sort((a, b) => b.point - a.point);
  const top2Points = sortedByPoint.slice(0, 2).map((s) => s.point);
  const top2PointPlayers = sortedByPoint.slice(0, 2).map((s) => s.name);

  // 승점 1,2위를 제외한 회원들 중에서 승률 1,2위 찾기
  const remainingForWinRate = qualifiedPlayers.filter(
    (p) => !top2PointPlayers.includes(p.name)
  );
  const sortedByWinRate = [...remainingForWinRate].sort(
    (a, b) => b.winRate - a.winRate || b.margin - a.margin
  );
  const top2WinRates = sortedByWinRate.slice(0, 2).map((s) => s.winRate);
  const top2WinRatePlayers = sortedByWinRate.slice(0, 2).map((s) => s.name);

  // 승점과 승률 1,2위를 제외한 회원들 중에서 마진 1,2위 찾기
  const remainingForMargin = qualifiedPlayers.filter(
    (p) =>
      !top2PointPlayers.includes(p.name) && !top2WinRatePlayers.includes(p.name)
  );
  const sortedByMargin = [...remainingForMargin].sort(
    (a, b) => b.margin - a.margin
  );
  const top2Margins = sortedByMargin.slice(0, 2).map((s) => s.margin);

  const getPointClass = (point: number) => {
    if (point === top2Points[0]) return 'bg-red-200 font-semibold';
    if (point === top2Points[1]) return 'bg-red-100 font-semibold';
    return '';
  };

  const getWinRateClass = (winRate: number) => {
    if (winRate === top2WinRates[0]) return 'bg-green-200 font-semibold';
    if (winRate === top2WinRates[1]) return 'bg-green-100 font-semibold';
    return '';
  };

  const getMarginClass = (margin: number) => {
    if (margin === top2Margins[0]) return 'bg-sky-200 font-semibold';
    if (margin === top2Margins[1]) return 'bg-sky-100 font-semibold';
    return '';
  };

  const handleNameClick = (name: string) => {
    router.push(`/player/${encodeURIComponent(name)}`);
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="table w-full text-center text-sm">
          <thead>
            <tr>
              <th>순위</th>
              <th>이름</th>
              <th>승</th>
              <th>무</th>
              <th>패</th>
              <th>게임</th>
              <th>승점</th>
              <th>승률</th>
              <th>득점</th>
              <th>실점</th>
              <th>마진</th>
            </tr>
          </thead>
          <tbody>
            {displayStats.map((row, idx) => (
              <tr key={row.name}>
                <td>{idx + 1}</td>
                <td>
                  <div
                    className="whitespace-nowrap cursor-pointer text-blue-700 hover:text-blue-900 transition-colors underline underline-offset-4"
                    onClick={() => handleNameClick(row.name)}
                  >
                    {row.name}
                  </div>
                </td>
                <td className="text-green-600 font-semibold">{row.win}</td>
                <td className="text-yellow-600">{row.draw}</td>
                <td className="text-red-600">{row.lose}</td>
                <td>{row.game}</td>
                <td
                  className={`font-semibold text-blue-600 ${getPointClass(row.point)}`}
                >
                  {row.point}
                </td>
                <td className={getWinRateClass(row.winRate)}>
                  {(row.winRate * 100).toFixed(1)}%
                </td>
                <td>{row.score}</td>
                <td>{row.loseScore}</td>
                <td className={getMarginClass(row.margin)}>
                  {row.margin > 0 ? '+' : ''}
                  {row.margin}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {stats.length > 10 && (
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
            className="px-6"
          >
            {showAll ? '접기' : `더보기 (${stats.length - 10}명 더)`}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function StatsTable() {
  const {
    data: games,
    isLoading,
    error,
  } = useSWR<GameResult[]>('/api/games?status=done');
  // 가입된 회원 목록 불러오기
  const { data: members } = useSWR<UserProps[]>('/api/members');

  // 가입된 회원 이름 목록
  const memberNames = useMemo(
    () => (members ? members.map((m) => m.name) : []),
    [members]
  );

  // stats에서 가입된 회원만 필터링
  const stats = useMemo(() => {
    if (!games) return [];
    const allStats = calculateStats(games);
    if (!memberNames.length) return allStats;
    return allStats.filter((s) => memberNames.includes(s.name));
  }, [games, memberNames]);

  if (isLoading) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">전체순위</h2>
        <LoadingGrid loading={isLoading} />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">전체순위</h2>
        <div className="text-center py-20 text-lg text-red-500 overflow-x-auto">
          데이터를 불러오는 중 오류가 발생했습니다.
        </div>
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">전체순위</h2>
        <div className="text-center py-20 text-lg text-gray-500">
          집계할 데이터가 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">전체순위</h2>
      <StatsTableContent stats={stats} />
    </div>
  );
}
