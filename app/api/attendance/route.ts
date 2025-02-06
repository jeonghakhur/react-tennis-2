import { addAttendance, removeAttendance } from '@/service/schedule';
import { withSessionUser } from '@/util/session';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest) {
  return withSessionUser(async () => {
    const { scheduleId, attendance } = await req.json();

    return addAttendance(scheduleId, attendance).then((data) =>
      NextResponse.json(data)
    );
  });
}

export async function DELETE(req: NextRequest) {
  return withSessionUser(async () => {
    const { scheduleId, attendeeKey } = await req.json(); // ✅ 요청에서 ID와 _key 받기
    console.log(scheduleId, attendeeKey);
    return removeAttendance(scheduleId, attendeeKey).then((data) =>
      NextResponse.json(data)
    );
  });
}
