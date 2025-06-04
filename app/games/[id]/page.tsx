'use client';

import { Container } from '@/components/Layout';
import LoadingGrid from '@/components/LoadingGrid';
import { use, useEffect, useState } from 'react';
import useGame from '@/hooks/useGames';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

type Props = {
  params: Promise<{ id: string }>;
};

interface GameResult {
  time: string;
  court: string;
  players: string[];
  score: string[];
}

export default function Page({ params }: Props) {
  const { id } = use(params);
  const { game, isLoading, removeGame } = useGame(id);
  const [loading, setLoading] = useState<boolean>(isLoading);
  const [editableGames, setEditableGames] = useState<GameResult[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (game) {
      console.log(game);
      setEditableGames([...game.games]);
      setLoading(false);
    }
  }, [game]);

  const handleDelete = async (id: string) => {
    const isConfirmed = confirm('정말 삭제하시겠습니까?');
    if (!isConfirmed) return;

    setLoading(true);
    try {
      const result = await removeGame(id);

      if (!result.success) {
        // 에러 발생 시 사용자에게 알림
        alert(result.error || '삭제 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('게임 삭제 중 오류:', error);
      alert('삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      // setLoading(false);
      // 성공/실패와 관계없이 목록 페이지로 이동
      router.push('/games');
    }
  };

  const handleUpdate = function (id: string) {
    console.log('update', id);
  };

  const handlePlayerChange = (
    gameIndex: number,
    playerIndex: number,
    value: string
  ) => {
    const updatedGames = [...editableGames];
    if (updatedGames[gameIndex]?.players) {
      updatedGames[gameIndex].players[playerIndex] = value;
      setEditableGames(updatedGames);
    }
  };

  const handleScoreChange = (
    gameIndex: number,
    scoreIndex: number,
    value: string
  ) => {
    const updatedGames = [...editableGames];
    if (updatedGames[gameIndex]?.score) {
      updatedGames[gameIndex].score[scoreIndex] = value;
      setEditableGames(updatedGames);
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingGrid loading={loading} />
      </Container>
    );
  }

  if (!game) {
    return (
      <Container>
        <div className="text-center py-8">게임 정보를 찾을 수 없습니다.</div>
      </Container>
    );
  }

  return (
    <Container>
      <div>
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {game.courtName}
            </h1>
            <div className="text-lg text-gray-600">
              {format(new Date(game.date), 'yyyy년 MM월 dd일 (EEE)', {
                locale: ko,
              })}
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {editableGames.map((result, index) => {
            return (
              <div key={index} className="bg-white rounded-lg shadow-md p-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-lg font-semibold">게임 {index + 1}</div>
                  <div className="text-sm text-gray-500">
                    {result.time} - {result.court} 코트
                  </div>
                </div>

                <div className="space-y-4">
                  {/* 페어 A */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={result.players[0]}
                          onChange={(e) =>
                            handlePlayerChange(index, 0, e.target.value)
                          }
                          className="w-full"
                        />
                        <Input
                          value={result.players[1]}
                          onChange={(e) =>
                            handlePlayerChange(index, 1, e.target.value)
                          }
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div className="w-20">
                      <Input
                        value={result.score[0]}
                        onChange={(e) =>
                          handleScoreChange(index, 0, e.target.value)
                        }
                        className="w-full text-center"
                      />
                    </div>
                  </div>

                  {/* 페어 B */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={result.players[2]}
                          onChange={(e) =>
                            handlePlayerChange(index, 2, e.target.value)
                          }
                          className="w-full"
                        />
                        <Input
                          value={result.players[3]}
                          onChange={(e) =>
                            handlePlayerChange(index, 3, e.target.value)
                          }
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div className="w-20">
                      <Input
                        value={result.score[1]}
                        onChange={(e) =>
                          handleScoreChange(index, 1, e.target.value)
                        }
                        className="w-full text-center"
                      />
                    </div>
                  </div>

                  {/* 게임별 수정/삭제 버튼 */}
                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleUpdate(game._id!)}
                    >
                      수정
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDelete(game._id!)}
                    >
                      삭제
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            type="button"
            variant="destructive"
            size="lg"
            className="flex-1"
            onClick={() => handleDelete(game._id!)}
          >
            전체 삭제
          </Button>
          <Button
            type="button"
            size="lg"
            className="flex-1"
            onClick={() => handleUpdate(game._id!)}
          >
            전체 수정
          </Button>
        </div>
      </div>
    </Container>
  );
}
