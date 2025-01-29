import { ScheduleFormSchema } from '@/model/schedule';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { createSchedule, getAllSchedule } from '@/service/schedule';
import { withSessionUser } from '@/util/session';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return withSessionUser(async () =>
    getAllSchedule().then((data) => NextResponse.json(data))
  );
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!user) {
    return new Response('Authentication Error', { status: 401 });
  }

  try {
    const body = await req.json();
    body.date = new Date(body.date);

    const validatedData = ScheduleFormSchema.parse(body);

    console.log('Saving data to the database...', validatedData, user.id);

    const scheduleResponse = await createSchedule(user.id, validatedData);

    if (!scheduleResponse?.success) {
      return NextResponse.json(
        {
          message: '일정 생성 중 오류가 발생했습니다.',
          error: scheduleResponse?.error,
        },
        { status: 500 }
      );
    }

    // 성공 시 응답
    return NextResponse.json({
      message: '일정이 성공적으로 등록되었습니다.',
      data: scheduleResponse?.data,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          message: '유효성 검사에 실패했습니다.',
          errors: error.message,
        },
        { status: 400 }
      );
    }
    console.error('Unexpected error:', error);
    return NextResponse.json(
      {
        message: '서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
