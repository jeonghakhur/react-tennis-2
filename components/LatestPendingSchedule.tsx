'use client';

import { GetScheduleProps } from '@/model/schedule';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';

export default function LatestPendingSchedule() {
  const router = useRouter();
  const {
    data: schedule,
    error,
    isLoading,
  } = useSWR<GetScheduleProps>('/api/schedule/latest-pending');

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !schedule) {
    return null; // 에러나 데이터가 없으면 아무것도 표시하지 않음
  }

  const getWorkoutInfo = (schedule: GetScheduleProps) => {
    const uniquePlayers = new Set(
      schedule.attendees?.map((attendee) => attendee.name) || []
    );

    return {
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      totalPlayers: uniquePlayers.size,
      courtCount: schedule.courtCount,
    };
  };

  const workoutInfo = getWorkoutInfo(schedule);

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-6">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">다음 게임 일정</h3>
        <div className="text-sm text-gray-600">
          {format(new Date(schedule.date), 'yyyy년 MM월 dd일 (EEE)', {
            locale: ko,
          })}{' '}
          • {schedule.courtName}
        </div>
      </div>

      {workoutInfo && (
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">시간</p>
            <p className="text-lg font-bold text-blue-600">
              {workoutInfo.startTime} - {workoutInfo.endTime}
            </p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">코트</p>
            <p className="text-lg font-bold text-green-600">
              {schedule.courtNumbers?.join(', ') || '0'}
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

      <div className="flex gap-2">
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={() => router.push(`/schedule/${schedule.id}`)}
          className="flex-1"
        >
          참석투표
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => router.push('/schedule')}
          className="flex-1"
        >
          전체 일정 보기
        </Button>
      </div>
    </div>
  );
}
