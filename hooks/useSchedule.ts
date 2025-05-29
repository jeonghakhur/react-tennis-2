/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AttendanceProps,
  GetScheduleProps,
  GetScheduleType,
  ScheduleFormType,
} from '@/model/schedule';
import useSWR, { useSWRConfig } from 'swr';

function sortByDate(schedules: GetScheduleType[]) {
  return schedules.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

async function addAttendance(scheduleId: string, attendance: AttendanceProps) {
  return fetch('/api/attendance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scheduleId, attendance }),
  }).then((res) => res.json());
}

async function updateAttendance(
  scheduleId: string,
  attendance: AttendanceProps
) {
  return fetch('/api/attendance', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scheduleId, attendance }),
  }).then((res) => res.json());
}

async function deleteAttendance(scheduleId: string, attendeeKey: string) {
  return fetch('/api/attendance', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scheduleId, attendeeKey }),
  }).then((res) => res.json());
}

async function createSchedule(newSchedule: ScheduleFormType) {
  return fetch('/api/schedule', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newSchedule),
  }).then((res) => res.json());
}

async function updateSchedule(
  scheduleId: string,
  updateData: ScheduleFormType
) {
  return fetch(`/api/schedule/${scheduleId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData),
  }).then((res) => res.json());
}

async function deleteSchedule(scheduleId: string) {
  return fetch(`/api/schedule/${scheduleId}`, {
    method: 'DELETE',
  }).then((res) => res.json());
}

export default function useSchedule(scheduleId?: string) {
  const {
    data: schedule,
    isLoading,
    error,
    mutate,
  } = useSWR<GetScheduleProps>(
    scheduleId ? `/api/schedule/${scheduleId}` : null,
    {
      revalidateOnFocus: false, // 🔹 포커스 시 다시 요청 방지
      revalidateOnReconnect: false, // 🔹 네트워크 변경 시 다시 요청 방지
    }
  );
  const { mutate: globalMutate } = useSWRConfig();
  // ✅ 전체 스케줄 목록 가져오기

  const attendees = schedule?.attendees;

  const postAttendance = async (attendance: AttendanceProps) => {
    if (!attendees) return;
    const newSchedule = {
      ...schedule,
      attendees: [...attendees, attendance],
    };

    return mutate(
      async () => {
        const response = await addAttendance(scheduleId!, attendance);
        return response; // ✅ 백엔드에서 업데이트된 데이터 반환
      },
      {
        optimisticData: newSchedule,
        rollbackOnError: false, // ❌ 실패 시 이전 상태로 복구
        populateCache: false, // ✅ SWR 캐시 최신 상태 유지
        revalidate: true, // ✅ 불필요한 API 요청 방지
      }
    );
  };

  const patchAttendance = async (attendance: AttendanceProps) => {
    if (!attendees) return;
    const newSchedule = {
      ...schedule,
      attendees: attendees.map((att) =>
        att._key === attendance._key ? { ...att, ...attendance } : att
      ),
    };

    return mutate(
      async () => {
        const response = await updateAttendance(scheduleId!, attendance);
        return response;
      },
      {
        optimisticData: newSchedule,
        populateCache: false,
        revalidate: false,
        rollbackOnError: true,
      }
    );
  };

  const removeAttendance = async (attendanceKey: string) => {
    if (!attendees) return;

    const updatedAttendees = attendees.filter(
      (att) => att._key !== attendanceKey
    );
    const newSchedule = { ...schedule, attendees: updatedAttendees };

    return mutate(
      async () => {
        const response = await deleteAttendance(scheduleId!, attendanceKey);
        return response;
      },
      {
        optimisticData: newSchedule,
        rollbackOnError: false,
        populateCache: false,
        revalidate: true,
      }
    );
  };

  const postSchedule = async (newSchedule: ScheduleFormType) => {
    console.log('🟢 postSchedule 실행됨', newSchedule);

    // ✅ 현재 목록 데이터 가져오기
    const currentSchedules = await globalMutate('/api/schedule');

    // // ✅ SWR 캐시에 새 데이터 즉시 반영 (Optimistic UI 적용)
    globalMutate(
      '/api/schedule',
      sortByDate([
        ...(currentSchedules || []),
        { ...newSchedule, id: 'temp-id' },
      ]),
      { revalidate: false }
    );

    try {
      const result = await createSchedule(newSchedule);

      // ✅ 서버에서 받은 최신 데이터를 SWR에 반영 + 정렬 적용
      // globalMutate('/api/schedule', async () => {
      //   const updatedData = await fetch('/api/schedule').then((res) =>
      //     res.json()
      //   );
      //   return sortByDate(updatedData); // ✅ 서버 데이터도 정렬
      // });

      console.log('✅ 스케줄 등록 성공!', result);
      return result;
    } catch (error) {
      console.error('❌ 스케줄 등록 실패:', error);

      // ❌ 에러 발생 시 이전 상태로 롤백
      // globalMutate('/api/schedule', currentSchedules, { revalidate: false });
      throw error;
    }
  };

  const patchSchedule = async (updateData: ScheduleFormType) => {
    console.log('patchSchedule');
    if (!schedule) return;

    const newSchedule = { ...schedule, ...updateData };

    return mutate(updateSchedule(scheduleId!, updateData), {
      optimisticData: newSchedule as unknown as GetScheduleProps,
      populateCache: false,
      revalidate: false,
      rollbackOnError: true,
    });
  };

  const removeSchedule = async () => {
    console.log('removeSchedule 실행됨');
    const currentSchedules = await globalMutate('/api/schedule');

    globalMutate(
      '/api/schedule',
      currentSchedules?.filter((schedule: any) => schedule.id !== scheduleId), // ✅ 삭제된 데이터를 제외한 새로운 배열 생성
      { revalidate: false } // ✅ 즉시 UI에서 반영하고 API 요청은 나중에 실행
    );
    await deleteSchedule(scheduleId!);

    // ✅ 서버에서 최신 데이터를 가져와 다시 반영
    globalMutate('/api/schedule');
  };

  return {
    schedule,
    isLoading,
    error,
    postSchedule,
    patchSchedule,
    removeSchedule,
    postAttendance,
    patchAttendance,
    removeAttendance,
  };
}
