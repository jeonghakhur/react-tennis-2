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
import DataGrid from '@/components/DataGrid';
import { toast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

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
  const { game, isLoading, removeGame, updateGameData } = useGame(id);
  const [loading, setLoading] = useState<boolean>(isLoading);
  const [dataLoading, setDataLoading] = useState<boolean>(false);
  const [editableGames, setEditableGames] = useState<GameResult[]>([]);
  const [scheduleStatus, setScheduleStatus] = useState<
    'match_done' | 'game_done'
  >('match_done');
  const router = useRouter();

  useEffect(() => {
    if (game) {
      console.log(game);
      setEditableGames([...game.games]);
      setScheduleStatus(
        game.scheduleStatus === 'game_done' ? 'game_done' : 'match_done'
      );
      setLoading(false);
    }
  }, [game]);

  const handleDelete = async (id: string) => {
    const isConfirmed = confirm('정말 삭제하시겠습니까?');
    if (!isConfirmed) return;

    setDataLoading(true);
    try {
      const result = await removeGame(id);

      if (result.success) {
        // 게임 결과 삭제 성공 시 스케줄 상태를 pending으로 변경
        if (game?.scheduleID) {
          console.log(
            '🔄 스케줄 상태를 pending으로 변경 시작:',
            game.scheduleID
          );
          const response = await fetch(`/api/schedule/${game.scheduleID}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: 'pending' }),
          });

          console.log(
            '📡 스케줄 상태 업데이트 응답:',
            response.status,
            response.statusText
          );

          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ 스케줄 상태 업데이트 실패:', errorText);
          } else {
            const responseData = await response.json();
            console.log('✅ 스케줄 상태 업데이트 성공:', responseData);
          }
        } else {
          console.warn('⚠️ scheduleID가 없습니다:', game);
        }
      } else {
        // 에러 발생 시 사용자에게 알림
        alert(result.error || '삭제 중 오류가 발생했습니다.');
        setDataLoading(false);
        return;
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

  const handleUpdate = async function (id: string) {
    console.log('handleUpdate', id);
    const isConfirmed = confirm('게임 정보를 수정하시겠습니까?');
    if (!isConfirmed) return;

    setDataLoading(true);
    try {
      // 게임 데이터 업데이트
      const gameResult = await updateGameData(id, editableGames);

      if (gameResult.success) {
        // 스케줄 상태 업데이트
        if (game?.scheduleID) {
          const response = await fetch(`/api/schedule/${game.scheduleID}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: scheduleStatus }),
          });

          if (!response.ok) {
            throw new Error('스케줄 상태 업데이트 실패');
          }
        }

        toast({
          title: '게임 정보가 성공적으로 수정되었습니다.',
          duration: 1500,
        });
        setTimeout(() => router.push('/games'), 1500);
      } else {
        alert(gameResult.error || '수정 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('게임 수정 중 오류:', error);
      alert('수정 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setDataLoading(false);
    }
  };

  const handleGameUpdate = async function (gameIndex: number) {
    if (!game) return;

    const isConfirmed = confirm(`게임 ${gameIndex + 1}을 수정하시겠습니까?`);
    if (!isConfirmed) return;

    setDataLoading(true);
    try {
      const result = await updateGameData(game._id!, editableGames);

      if (result.success) {
        toast({
          title: `게임 ${gameIndex + 1}이 성공적으로 수정되었습니다.`,
          duration: 1500,
        });
      } else {
        alert(result.error || '수정 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('게임 수정 중 오류:', error);
      alert('수정 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setDataLoading(false);
    }
  };

  const handleGameDelete = async function (gameIndex: number) {
    if (!game) return;

    const isConfirmed = confirm(`게임 ${gameIndex + 1}을 삭제하시겠습니까?`);
    if (!isConfirmed) return;

    setDataLoading(true);
    try {
      // 해당 게임을 배열에서 제거
      const updatedGames = editableGames.filter(
        (_, index) => index !== gameIndex
      );

      if (updatedGames.length === 0) {
        // 모든 게임이 삭제되면 전체 게임 결과를 삭제하고 스케줄 상태를 pending으로 변경
        const result = await removeGame(game._id!);
        if (result.success) {
          // 스케줄 상태를 pending으로 변경
          if (game.scheduleID) {
            console.log(
              '🔄 개별 게임 삭제 후 스케줄 상태를 pending으로 변경:',
              game.scheduleID
            );
            const response = await fetch(`/api/schedule/${game.scheduleID}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ status: 'pending' }),
            });

            console.log(
              '📡 개별 삭제 후 스케줄 상태 업데이트 응답:',
              response.status
            );

            if (!response.ok) {
              const errorText = await response.text();
              console.error(
                '❌ 개별 삭제 후 스케줄 상태 업데이트 실패:',
                errorText
              );
            } else {
              const responseData = await response.json();
              console.log(
                '✅ 개별 삭제 후 스케줄 상태 업데이트 성공:',
                responseData
              );
            }
          }
        } else {
          alert(result.error || '삭제 중 오류가 발생했습니다.');
        }
        router.push('/games');
        return;
      }

      // 남은 게임들로 업데이트 (일부 게임만 삭제되므로 스케줄 상태는 match_done 유지)
      const result = await updateGameData(game._id!, updatedGames);

      if (result.success) {
        setEditableGames(updatedGames);
        toast({
          title: `게임 ${gameIndex + 1}이 성공적으로 삭제되었습니다.`,
          duration: 1500,
        });
      } else {
        alert(result.error || '삭제 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('게임 삭제 중 오류:', error);
      alert('삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setDataLoading(false);
    }
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
      {dataLoading && <DataGrid loading={true} />}
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
                      onClick={() => handleGameUpdate(index)}
                    >
                      수정
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleGameDelete(index)}
                    >
                      삭제
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2 justify-between mt-4">
          <label htmlFor="status" className="font-bold">
            게임 결과 노출
          </label>
          <Switch
            id="status"
            name="status"
            checked={scheduleStatus === 'game_done'}
            onCheckedChange={(checked) =>
              setScheduleStatus(checked ? 'game_done' : 'match_done')
            }
          />
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
