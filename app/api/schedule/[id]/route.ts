import {
  deleteSchedule,
  getSchedule,
  updateSchedule,
} from '@/service/schedule';
import { withSessionUser } from '@/util/session';

import { NextRequest, NextResponse } from 'next/server';

type Context = {
  params: Promise<{ id: string }>; // params가 Promise로 감싸져 있음
};
export async function GET(_: NextRequest, context: Context) {
  const { id } = await context.params; // params를 비동기로 처리

  return withSessionUser(async () =>
    getSchedule(id) //
      .then((data) => NextResponse.json(data))
  );
}

export async function PATCH(req: NextRequest, context: Context) {
  try {
    const { id } = await context.params;
    const body = await req.json(); // 클라이언트에서 전송된 데이터 받기

    if (!id || !body) {
      return NextResponse.json(
        { error: 'ID 또는 데이터가 없습니다.' },
        { status: 400 }
      );
    }

    const updatedSchedule = await updateSchedule(id, body);

    return NextResponse.json({
      message: '일정이 성공적으로 업데이트되었습니다.',
      data: updatedSchedule,
    });
  } catch (error) {
    console.error('❌ PATCH /api/schedule/:id Error:', error);
    return NextResponse.json({ error: '서버 오류 발생' }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, context: Context) {
  const { id } = await context.params;

  return withSessionUser(async () =>
    deleteSchedule(id).then((data) => NextResponse.json(data))
  );
}
