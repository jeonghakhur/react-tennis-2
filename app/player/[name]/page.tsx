'use client';

import { Container } from '@/components/Layout';
import { GameResult } from '@/model/gameResult';
import LoadingGrid from '@/components/LoadingGrid';
import useSWR from 'swr';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

type PlayerGameResult = {
  date: string;
  courtName: string;
  team: string;
  opponent: string;
  score: string;
  result: 'win' | 'lose' | 'draw';
  gameNumber: number;
};

export default function PlayerGameHistory() {
  const params = useParams();
  const router = useRouter();
  const {
    data: games,
    isLoading,
    error,
  } = useSWR<GameResult[]>('/api/games?status=game_done');

  const playerName = params?.name
    ? decodeURIComponent(params.name as string)
    : '';

  if (!playerName) {
    return (
      <Container>
        <div className="text-center py-20 text-lg text-red-500">
          플레이어 정보를 찾을 수 없습니다.
        </div>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container>
        <div className="text-center py-20">
          <LoadingGrid loading={isLoading} />
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

  if (!games || games.length === 0) {
    return (
      <Container>
        <div className="text-center py-20 text-lg text-gray-500">
          게임 데이터가 없습니다.
        </div>
      </Container>
    );
  }

  // 플레이어의 모든 게임 결과 추출
  const playerGames: PlayerGameResult[] = [];

  games.forEach((gameResult) => {
    gameResult.games.forEach((game, gameIndex) => {
      const [scoreA = 0, scoreB = 0] = game.score.map(Number);
      const teamA = [game.players[0], game.players[1]].filter(
        (p): p is string => !!p
      );
      const teamB = [game.players[2], game.players[3]].filter(
        (p): p is string => !!p
      );

      // 플레이어가 팀A에 있는지 확인
      if (teamA.includes(playerName)) {
        const result =
          scoreA > scoreB ? 'win' : scoreA < scoreB ? 'lose' : 'draw';
        playerGames.push({
          date: gameResult.date,
          courtName: gameResult.courtName,
          team: teamA.join(', '),
          opponent: teamB.join(', '),
          score: `${scoreA}:${scoreB}`,
          result,
          gameNumber: gameIndex + 1,
        });
      }

      // 플레이어가 팀B에 있는지 확인
      if (teamB.includes(playerName)) {
        const result =
          scoreB > scoreA ? 'win' : scoreB < scoreA ? 'lose' : 'draw';
        playerGames.push({
          date: gameResult.date,
          courtName: gameResult.courtName,
          team: teamB.join(', '),
          opponent: teamA.join(', '),
          score: `${scoreB}:${scoreA}`,
          result,
          gameNumber: gameIndex + 1,
        });
      }
    });
  });

  // 날짜순으로 정렬 (최신순)
  playerGames.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // 통계 계산
  const totalGames = playerGames.length;
  const wins = playerGames.filter((game) => game.result === 'win').length;
  const draws = playerGames.filter((game) => game.result === 'draw').length;
  const losses = playerGames.filter((game) => game.result === 'lose').length;
  const winRate =
    totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : '0.0';

  const handleTeamClick = (team: string) => {
    const teamMembers = team
      .split(', ')
      .filter((member) => member.trim() !== '');
    if (teamMembers.length === 2) {
      const sortedMembers = teamMembers.sort();
      const pairUrl = `/pair/${sortedMembers.join('+')}`;
      router.push(pairUrl);
    }
  };

  return (
    <Container>
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {playerName}님의 게임 기록
          </h1>
          <p className="text-gray-600">
            총 {totalGames}경기 • {wins}승 {draws}무 {losses}패 • 승률 {winRate}
            %
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border text-center">
            <div className="text-2xl font-bold text-blue-600">{totalGames}</div>
            <div className="text-sm text-gray-600">총 경기</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border text-center">
            <div className="text-2xl font-bold text-green-600">{wins}</div>
            <div className="text-sm text-gray-600">승</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border text-center">
            <div className="text-2xl font-bold text-yellow-600">{draws}</div>
            <div className="text-sm text-gray-600">무</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border text-center">
            <div className="text-2xl font-bold text-red-600">{losses}</div>
            <div className="text-sm text-gray-600">패</div>
          </div>
        </div>

        {/* 게임 기록 테이블 */}
        {playerGames.length > 0 ? (
          <div className="bg-white rounded-lg shadow border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left">날짜</th>
                    <th className="text-left">장소</th>
                    <th className="text-left">팀</th>
                    <th className="text-left">상대팀</th>
                    <th className="text-center">스코어</th>
                    <th className="text-center">결과</th>
                  </tr>
                </thead>
                <tbody>
                  {playerGames.map((game, index) => (
                    <tr key={index} className="border-t">
                      <td className="py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {format(new Date(game.date), 'MM.dd')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(game.date), 'EEEE', { locale: ko })}
                        </div>
                      </td>
                      <td className="py-3 text-sm text-gray-900">
                        {game.courtName}
                      </td>
                      <td className="py-3 text-sm text-gray-900">
                        <span
                          className="cursor-pointer text-blue-600 underline hover:text-blue-800"
                          onClick={() => handleTeamClick(game.team)}
                          title={`${game.team} 페어 기록 보기`}
                        >
                          {game.team}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-gray-900">
                        <span
                          className="cursor-pointer text-blue-600 underline hover:text-blue-800"
                          onClick={() => handleTeamClick(game.opponent)}
                          title={`${game.opponent} 페어 기록 보기`}
                        >
                          {game.opponent}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <span className="text-sm font-medium text-gray-900">
                          {game.score}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            game.result === 'win'
                              ? 'bg-green-100 text-green-800'
                              : game.result === 'draw'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {game.result === 'win'
                            ? '승'
                            : game.result === 'draw'
                              ? '무'
                              : '패'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-lg text-gray-500">
            {playerName}님의 게임 기록이 없습니다.
          </div>
        )}
      </div>
    </Container>
  );
}
