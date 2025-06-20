'use client';

import { GameResult } from '@/model/gameResult';
import LoadingGrid from '@/components/LoadingGrid';
import useSWR from 'swr';
import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Button } from './ui/button';

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

export default function LatestGameRanking() {
  const [showAll, setShowAll] = useState(false);
  const {
    data: games,
    isLoading,
    error,
  } = useSWR<GameResult[]>('/api/games?status=game_done');

  // 마지막 스케줄의 game_done 게임만 필터링
  const latestGame = useMemo(() => {
    if (!games || games.length === 0) return null;
    return games
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .find((game) => game.games && game.games.length > 0);
  }, [games]);

  const stats = useMemo(() => {
    if (!latestGame) return [];
    return calculateStats([latestGame]);
  }, [latestGame]);

  const displayStats = showAll ? stats : stats.slice(0, 3);

  if (isLoading) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          최근게임순위
        </h2>
        <LoadingGrid loading={isLoading} />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          최근게임순위
        </h2>
        <div className="text-center py-20 text-lg text-red-500 overflow-x-auto">
          데이터를 불러오는 중 오류가 발생했습니다.
        </div>
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          최근게임순위
        </h2>
        <div className="text-center py-20 text-lg text-gray-500">
          최근 완료된 게임 데이터가 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        최근게임순위
        {latestGame && (
          <span className="text-sm font-normal text-gray-600 ml-2">
            ({format(new Date(latestGame.date), 'MM.dd')})
          </span>
        )}
      </h2>
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
                <td className="font-semibold">
                  {idx === 0 && '🥇'}
                  {idx === 1 && '🥈'}
                  {idx === 2 && '🥉'}
                  {idx > 2 && (showAll ? idx + 1 : idx + 1)}
                </td>
                <td className="whitespace-nowrap font-medium">{row.name}</td>
                <td className="text-green-600 font-semibold">{row.win}</td>
                <td className="text-yellow-600">{row.draw}</td>
                <td className="text-red-600">{row.lose}</td>
                <td>{row.game}</td>
                <td className="font-semibold text-blue-600">{row.point}</td>
                <td className="font-semibold">
                  {(row.winRate * 100).toFixed(1)}%
                </td>
                <td>{row.score}</td>
                <td>{row.loseScore}</td>
                <td
                  className={
                    row.margin > 0
                      ? 'text-green-600'
                      : row.margin < 0
                        ? 'text-red-600'
                        : ''
                  }
                >
                  {row.margin > 0 ? '+' : ''}
                  {row.margin}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {stats.length > 3 && (
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
            className="px-6"
          >
            {showAll ? '접기' : `더보기 (${stats.length - 3}명 더)`}
          </Button>
        </div>
      )}
    </div>
  );
}
