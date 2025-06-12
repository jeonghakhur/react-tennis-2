'use client';

import { Container } from '@/components/Layout';
import LoadingGrid from '@/components/LoadingGrid';
import { GameResult } from '@/model/gameResult';
import { useSession } from 'next-auth/react';
import { useMemo } from 'react';
import useSWR from 'swr';

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

function StatsTable({ stats }: { stats: PlayerStats[] }) {
  return (
    <table className="table">
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
        {stats.map((row, idx) => (
          <tr key={row.name}>
            <td>{idx + 1}</td>
            <td>{row.name}</td>
            <td>{row.win}</td>
            <td>{row.draw}</td>
            <td>{row.lose}</td>
            <td>{row.game}</td>
            <td>{row.point}</td>
            <td>{(row.winRate * 100).toFixed(1)}%</td>
            <td>{row.score}</td>
            <td>{row.loseScore}</td>
            <td>{row.margin}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Home() {
  const { data: session } = useSession();
  const userLevel = session?.user?.level ?? 0;
  const { data: games, isLoading, error } = useSWR<GameResult[]>('/api/games');
  const stats = useMemo(() => (games ? calculateStats(games) : []), [games]);

  if (userLevel < 1) {
    return (
      <Container>
        <div className="text-center py-20 text-lg text-gray-500">
          권한이 없습니다. 관리자에게 문의해주세요.
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div className="text-center py-20 text-lg text-red-500">
          데이터를 불러오는 중 오류가 발생했습니다.
        </div>
      </Container>
    );
  }

  return (
    <Container>
      {isLoading ? (
        <LoadingGrid loading={isLoading} />
      ) : stats.length === 0 ? (
        <div className="text-center py-20 text-lg text-gray-500">
          집계할 데이터가 없습니다.
        </div>
      ) : (
        <StatsTable stats={stats} />
      )}
    </Container>
  );
}
