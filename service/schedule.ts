import { ScheduleFormType } from '@/model/schedule';
import { AuthUser } from '@/model/user';
import { client } from '@/sanity/lib/client';

export async function getSchedule(id: string) {
  return client.fetch(`*[_type == "schedule" && _id == "${id}"][0]{
    ...,
    "id": _id,
    }`);
}

export async function getAllSchedule() {
  return client.fetch(`*[_type == "schedule"] | order(dateTime(date) desc) {
    ...,
    "id": _id,
  }`);
}

export async function createSchedule(
  userId: string,
  scheduleData: ScheduleFormType
) {
  const { date, startTime, endTime, courtName, courtCount, courtNumbers, attendees } =
    scheduleData;
    console.log('attendees', attendees)
    return client.create({
        _type: 'schedule',
        author: { _ref: userId },
        date,
        startTime,
        endTime,
        courtName,
        courtCount,
        courtNumbers: courtNumbers.map((item) => ({
          number: item.number,
        })),
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
    await client.delete(id);
    console.log(`✅ Schedule ${id} deleted successfully`);
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ Error deleting schedule ${id}:`, error);
      return { success: false, error: error.message };
    }
  }
}

type AttendeesProp = {
  name: string;
  gender?: string;
  startHour: string;
  startMinute: string;
  endHour: string;
  endMinute: string;
}

export async function addAttendees(user: AuthUser, scheduleId: string, data: AttendeesProp) {
  const schedule = await client.getDocument(scheduleId);
  const attendees = schedule?.attendees || [];

  // ✅ 동일한 name이 존재하는지 확인
  const existingIndex = attendees.findIndex((attendee: AttendeesProp) => attendee.name === user.name);

  if (existingIndex !== -1) {
    // ✅ 동일한 참석자가 있을 경우 → 수정 (`.set()`)
    const existingAttendee = attendees[existingIndex];
    return client
      .patch(scheduleId)
      .set({
        [`attendees[${existingIndex}]`]: {
          ...existingAttendee,
          gender: user.gender,
          startHour: data.startHour,
          startMinute: data.startMinute,
          endHour: data.endHour,
          endMinute: data.endMinute,
        },
      })
      .commit();
  } else {
    // ✅ 동일한 참석자가 없을 경우 → 추가 (`.append()`)
    return client
      .patch(scheduleId)
      .setIfMissing({ attendees: [] }) // attendees 배열이 없으면 생성
      .append('attendees', [
        {
          name: user.name,
          gender: user.gender,
          startHour: data.startHour,
          startMinute: data.startMinute,
          endHour: data.endHour,
          endMinute: data.endMinute,
        },
      ])
      .commit({ autoGenerateArrayKeys: true });
  }
}