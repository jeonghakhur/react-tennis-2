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
  const { id } = await context.params;
  const body = await req.json();
  return withSessionUser(async () =>
    updateSchedule(id, body).then((data) => {
      return NextResponse.json({
        message: '일정이 성공적으로 업데이트되었습니다.',
        data,
      });
    })
  );
}

export async function DELETE(_: NextRequest, context: Context) {
  const { id } = await context.params;

  return withSessionUser(async () =>
    deleteSchedule(id).then((data) => NextResponse.json(data))
  );
}
