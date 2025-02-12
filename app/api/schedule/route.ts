import { ScheduleFormSchema } from '@/model/schedule';
import { createSchedule, getAllSchedule } from '@/service/schedule';
import { withSessionUser } from '@/util/session';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return getAllSchedule().then((data) => NextResponse.json(data));
}

export async function POST(req: NextRequest) {
  return withSessionUser(async (user) => {
    const body = await req.json();
    body.date = new Date(body.date);
    console.log(body);

    const validatedData = ScheduleFormSchema.parse(body);

    return createSchedule(user.id, validatedData).then((data) =>
      NextResponse.json(data)
    );
  });
}
