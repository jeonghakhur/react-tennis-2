import { AttendanceProps, ScheduleFormType } from '@/model/schedule';
import { client } from '@/sanity/lib/client';

export async function getSchedule(id: string) {
  return client.fetch(`*[_type == "schedule" && _id == "${id}"][0]{
    ...,
    "id": _id,
    }`);
}

export async function getAllSchedule() {
  return client.fetch(`*[_type == "schedule"] | order(date desc) {
    ...,
    "id": _id,
  }`);
}

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
  } = scheduleData;
  console.log('attendees', attendees);
  return client.create(
    {
      _type: 'schedule',
      author: { _ref: userId },
      date,
      startTime,
      endTime,
      courtName,
      courtCount,
      courtNumbers,
      attendees,
    },
    { autoGenerateArrayKeys: true }
  );
}

export async function updateSchedule(
  scheduleId: string,
  updateData: ScheduleFormType
) {
  try {
    const updatedSchedule = await client
      .patch(scheduleId) // 업데이트할 문서의 ID
      .set(updateData) // 업데이트할 데이터
      .commit(); // 변경 사항 저장

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
