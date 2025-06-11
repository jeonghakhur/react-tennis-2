'use client';

import { Container } from '@/components/Layout';
import LoadingGrid from '@/components/LoadingGrid';
import useAuthRedirect from '@/hooks/useAuthRedirect';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { GetScheduleProps } from '@/model/schedule';

export default function ScheduleList() {
  const { isLoading, user } = useAuthRedirect('/', 0);
  const { data: schedules, error } = useSWR<GetScheduleProps[]>(
    isLoading ? null : '/api/schedule'
  );
  const [loading, setLoading] = useState<boolean>(isLoading);
  const router = useRouter();

  useEffect(() => {
    if (schedules || error) {
      setLoading(false);
    }
  }, [schedules, error]);

  const getWorkoutInfo = (schedule: GetScheduleProps) => {
    const uniquePlayers = new Set(
      schedule.attendees?.map((attendee) => attendee.name) || []
    );
    console.log('Unique players:', Array.from(uniquePlayers));

    return {
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      totalPlayers: uniquePlayers.size,
      courtCount: schedule.courtCount,
    };
  };

  if (loading) {
    return (
      <Container>
        <LoadingGrid loading={loading} />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col items-center text-center">
            <div className="bg-gray-50 rounded-lg p-8 w-full max-w-md">
              <div className="text-gray-500 mb-4">
                <svg
                  className="mx-auto h-12 w-12 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                데이터를 불러오는데 실패했습니다
              </h3>
              <p className="text-gray-500 mb-6">잠시 후 다시 시도해주세요.</p>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.location.reload()}
                className="w-full max-w-xs"
              >
                다시 시도
              </Button>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  if (!schedules || schedules.length === 0) {
    return (
      <Container>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col items-center text-center">
            <div className="bg-gray-50 rounded-lg p-8 w-full max-w-md">
              <div className="text-gray-500 mb-4">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                등록된 스케줄이 없습니다
              </h3>
              <p className="text-gray-500 mb-6">
                아직 등록된 스케줄이 없습니다.
              </p>
              {user && user.level >= 3 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/schedule/new')}
                  className="w-full max-w-xs"
                >
                  새 스케줄 등록하기
                </Button>
              )}
            </div>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="p-5">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">게임 일정</h1>

        {user && user.level >= 3 && (
          <Button
            type="button"
            onClick={() => router.push('/schedule/new')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            새 일정 등록
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {schedules.map((schedule) => {
          const workoutInfo = getWorkoutInfo(schedule);
          console.log('🔍 Schedule Debug Info:', {
            userLevel: user?.level,
            scheduleStatus: schedule.status,
            scheduleId: schedule.id,
            hasGameResult: schedule.hasGameResult,
            gameResultId: schedule.gameResultId,
            gameResultCount: schedule.gameResultCount,
          });
          return (
            <div
              key={schedule.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {schedule.courtName}
                  </h2>
                  <p className="text-gray-600">
                    {format(new Date(schedule.date), 'yyyy년 MM월 dd일 (EEE)', {
                      locale: ko,
                    })}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  {schedule.courtNumbers?.join(', ') || '0'} 코트
                </div>
              </div>

              {workoutInfo && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">시작 시간</p>
                    <p className="text-lg font-bold text-blue-600">
                      {workoutInfo.startTime}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">종료 시간</p>
                    <p className="text-lg font-bold text-green-600">
                      {workoutInfo.endTime}
                    </p>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">총 참석자</p>
                    <p className="text-lg font-bold text-orange-600">
                      {workoutInfo.totalPlayers}명
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {schedule.attendees?.map((attendee, index) => (
                  <div
                    key={attendee._key ?? index}
                    className="bg-gray-100 rounded-lg p-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        참가자 {index + 1}
                      </span>
                      <div className="text-sm">
                        {attendee.name} ({attendee.gender})
                      </div>
                      <span className="text-sm text-gray-500">
                        {attendee.startHour}:{attendee.startMinute} -{' '}
                        {attendee.endHour}:{attendee.endMinute}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid mt-3">
                {user && user.level >= 3 && (
                  <>
                    {schedule.status === 'attendees_done' && (
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          className="flex-1"
                          variant="default"
                          size="lg"
                          onClick={() => {
                            router.push(`/match/${schedule.id}`);
                          }}
                          disabled={schedule.hasGameResult}
                        >
                          대진표작성
                          {schedule.hasGameResult && ' (결과 등록됨)'}
                        </Button>
                        <Button
                          type="button"
                          className="flex-1"
                          variant="outline"
                          size="lg"
                          onClick={() =>
                            router.push(`/schedule/${schedule.id}`)
                          }
                          disabled={schedule.hasGameResult}
                        >
                          참석자 등록
                          {schedule.hasGameResult && ' (결과 등록됨)'}
                        </Button>
                      </div>
                    )}
                    {schedule.status === 'match_done' && (
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          disabled={schedule.hasGameResult}
                        >
                          게임결과 등록
                          {schedule.hasGameResult && ' (등록 완료)'}
                        </Button>
                        {schedule.hasGameResult && schedule.gameResultId && (
                          <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            onClick={() =>
                              router.push(`/games/${schedule.gameResultId}`)
                            }
                          >
                            게임 결과 보기
                          </Button>
                        )}
                      </div>
                    )}
                    {schedule.status === 'pending' && (
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() => router.push(`/schedule/${schedule.id}`)}
                        disabled={schedule.hasGameResult}
                      >
                        참석자 등록
                        {schedule.hasGameResult && ' (결과 등록됨)'}
                      </Button>
                    )}
                  </>
                )}

                {user && user.level < 3 && (
                  <>
                    {schedule.status !== 'game_done' &&
                      !schedule.hasGameResult && (
                        <Button
                          type="button"
                          variant="default"
                          size="lg"
                          onClick={() =>
                            router.push(`/schedule/${schedule.id}`)
                          }
                        >
                          참석투표
                        </Button>
                      )}
                    {schedule.hasGameResult && (
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() =>
                          router.push(`/games/${schedule.gameResultId}`)
                        }
                      >
                        게임 결과 보기
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Container>
  );
}
