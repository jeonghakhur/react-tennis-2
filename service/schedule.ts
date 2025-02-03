import { ScheduleFormType } from '@/model/schedule';
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
  const { date, startTime, endTime, courtName, courtCount, courtNumbers } =
    scheduleData;
    return client.create({
        _type: 'schedule',
        author: { _ref: userId },
        date,
        startTime,
        endTime,
        courtName,
        courtCount,
        courtNumbers: courtNumbers.map((number) => ({
          number,
        }))
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
