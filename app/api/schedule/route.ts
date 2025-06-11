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

    console.log('🔍 API에서 받은 데이터:', body);

    // status가 없으면 기본값 설정
    if (!body.status) {
      body.status = 'pending';
      console.log('⚠️ status가 없어서 기본값으로 설정:', body.status);
    }

    console.log('📋 Zod 검증 전 데이터:', body);

    const validatedData = ScheduleFormSchema.parse(body);

    console.log('✅ Zod 검증 완료된 데이터:', validatedData);

    return createSchedule(user.id, validatedData).then((data) => {
      console.log('💾 Sanity에 저장된 데이터:', data);
      return NextResponse.json(data);
    });
  });
}
