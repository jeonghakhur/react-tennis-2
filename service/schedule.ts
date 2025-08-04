import { AttendanceProps, ScheduleFormType } from '@/model/schedule';
import { client } from '@/sanity/lib/client';

export async function getSchedule(id: string) {
  return client.fetch(`*[_type == "schedule" && _id == "${id}"][0]{
    ...,
    "id": _id,
    "comments": comments[]{
      ...,
      "author": {
        "_ref": author._ref,
        "name": author->name,
        "username": author->username,
        "image": author->image
      },

    }
  }`);
}

export async function getAllSchedule() {
  return client.fetch(`*[_type == "schedule"] | order(date desc) {
    ...,
    "id": _id,
    "hasGameResult": count(*[_type == "gameResult" && schedule._ref == ^._id]) > 0,
    "gameResultId": *[_type == "gameResult" && schedule._ref == ^._id][0]._id,
    "gameResultCount": count(*[_type == "gameResult" && schedule._ref == ^._id])
  }`);
}

// export async function getLatestPendingSchedule() {
//   const today = new Date();
//   const yyyy = today.getFullYear();
//   const mm = String(today.getMonth() + 1).padStart(2, '0');
//   const dd = String(today.getDate() - 1).padStart(2, '0');
//   const todayStr = `${yyyy}-${mm}-${dd}`;

//   return client.fetch(
//     `*[_type == "schedule" && date >= $todayStr] | order(date asc)[0] {
//     ...,
//     "id": _id,
//     "hasGameResult": count(*[_type == "gameResult" && schedule._ref == ^._id]) > 0,
//     "gameResultId": *[_type == "gameResult" && schedule._ref == ^._id][0]._id,
//     "gameResultCount": count(*[_type == "gameResult" && schedule._ref == ^._id])
//   }`,
//     { todayStr }
//   );
// }

export async function createSchedule(
  userId: string,
  scheduleData: ScheduleFormType
) {
  const {
    date,
    startTime,
    endTime,
    courtName,
    courtCount,
    courtNumbers,
    attendees,
    status,
  } = scheduleData;

  console.log('📋 createSchedule에서 받은 데이터:', scheduleData);
  console.log('🎯 status 값:', status);
  console.log('👤 userId:', userId);

  try {
    // 사용자 ID 유효성 확인
    if (!userId) {
      throw new Error('사용자 ID가 없습니다.');
    }

    // 사용자가 존재하는지 확인
    const userExists = await client.fetch(
      `*[_type == "user" && _id == $userId][0]`,
      { userId }
    );

    if (!userExists) {
      console.warn('⚠️ 존재하지 않는 사용자 ID:', userId);
      // 사용자가 존재하지 않으면 author 필드를 제외하고 생성
      const result = await client.create(
        {
          _type: 'schedule',
          date,
          startTime,
          endTime,
          courtName,
          courtCount,
          courtNumbers, // [{ number, startTime, endTime }]
          attendees,
          status: status || 'pending', // status 필드 추가 및 기본값 보장
        },
        { autoGenerateArrayKeys: true }
      );
      console.log('✅ Sanity 저장 성공 (author 없음):', result);
      return result;
    }

    // courtNumbers는 [{ number, startTime, endTime }] 형태의 객체 배열이어야 함
    const result = await client.create(
      {
        _type: 'schedule',
        author: { _ref: userId },
        date,
        startTime,
        endTime,
        courtName,
        courtCount,
        courtNumbers, // [{ number, startTime, endTime }]
        attendees,
        status: status || 'pending', // status 필드 추가 및 기본값 보장
      },
      { autoGenerateArrayKeys: true }
    );

    console.log('✅ Sanity 저장 성공:', result);
    return result;
  } catch (error) {
    console.error('❌ Sanity 저장 실패:', error);
    throw error;
  }
}

export async function updateSchedule(
  scheduleId: string,
  updateData: ScheduleFormType
) {
  try {
    // courtNumbers는 [{ number, startTime, endTime }] 형태의 객체 배열이어야 함
    const updatedSchedule = await client
      .patch(scheduleId)
      .set(updateData)
      .commit();

    return updatedSchedule;
  } catch (error) {
    console.error('❌ updateSchedule Error:', error);
    throw new Error('데이터 업데이트 중 오류 발생');
  }
}

export async function deleteSchedule(id: string) {
  try {
    await client.transaction().delete(id).commit({ visibility: 'async' });
    console.log(`✅ Schedule ${id} deleted successfully`);
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ Error deleting schedule ${id}:`, error);
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Unknown error' };
  }
}

export async function addAttendance(
  scheduleId: string,
  data: AttendanceProps,
  userId: string
) {
  return client
    .patch(scheduleId)
    .setIfMissing({ attendees: [] }) // attendees 배열이 없으면 생성
    .append('attendees', [
      {
        author: { _ref: userId, _type: 'reference' },
        ...data,
      },
    ])
    .commit({ autoGenerateArrayKeys: true });
}

export async function updateAttendance(
  scheduleId: string,
  data: AttendanceProps
) {
  return client
    .patch(scheduleId)
    .set({ [`attendees[_key=="${data._key}"]`]: data })
    .commit();
}

export async function removeAttendance(
  scheduleId: string,
  attendeeKey: string
) {
  return client
    .patch(scheduleId)
    .unset([`attendees[_key=="${attendeeKey}"]`])
    .commit();
}

export async function updateScheduleStatus(
  scheduleId: string,
  status: 'pending' | 'attendees_done' | 'match_done' | 'game_done'
) {
  try {
    const updatedSchedule = await client
      .patch(scheduleId)
      .set({ status })
      .commit();

    return updatedSchedule;
  } catch (error) {
    console.error('❌ updateScheduleStatus Error:', error);
    throw new Error('스케줄 상태 업데이트 중 오류 발생');
  }
}

// 게임 통계 조회기간 조회
export async function getStatsPeriod() {
  return client.fetch(
    `*[_type == "gameStatsPeriod"] | order(_createdAt desc)[0]`
  );
}

// 게임 통계 조회기간 저장(업데이트 또는 생성)
export async function setStatsPeriod(startDate: string, endDate: string) {
  // 항상 하나만 존재하도록, 기존 document가 있으면 업데이트, 없으면 생성
  const existing = await client.fetch(
    `*[_type == "gameStatsPeriod"] | order(_createdAt desc)[0]`
  );
  if (existing && existing._id) {
    // 업데이트
    return client.patch(existing._id).set({ startDate, endDate }).commit();
  } else {
    // 새로 생성
    return client.create({
      _type: 'gameStatsPeriod',
      startDate,
      endDate,
    });
  }
}
