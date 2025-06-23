import {
  deleteSchedule,
  getSchedule,
  updateSchedule,
} from '@/service/schedule';
import { withSessionUser } from '@/util/session';
import { client } from '@/sanity/lib/client';
import { getGameIdByScheduleId, deleteGame } from '@/service/games';

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

  console.log('🔍 스케줄 업데이트 요청:', { id, body });

  return withSessionUser(async () => {
    try {
      // status만 업데이트하는 경우
      if (body.status && Object.keys(body).length === 1) {
        console.log('📝 status만 업데이트:', body.status);
        const updatedSchedule = await client
          .patch(id)
          .set({ status: body.status })
          .commit();

        console.log('✅ 스케줄 상태 업데이트 완료:', updatedSchedule);
        return NextResponse.json({
          message: '스케줄 상태가 성공적으로 업데이트되었습니다.',
          data: updatedSchedule,
        });
      } else {
        // 전체 스케줄 업데이트
        const updatedSchedule = await updateSchedule(id, body);
        return NextResponse.json({
          message: '일정이 성공적으로 업데이트되었습니다.',
          data: updatedSchedule,
        });
      }
    } catch (error) {
      console.error('❌ 스케줄 업데이트 에러:', error);
      return NextResponse.json(
        { error: '스케줄 업데이트 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
  });
}

export async function DELETE(_: NextRequest, context: Context) {
  const { id } = await context.params;

  return withSessionUser(async () => {
    // 1. 스케줄에 연결된 게임 결과가 있는지 확인
    const gameResultId = await getGameIdByScheduleId(id);
    if (gameResultId) {
      // 2. 게임 결과가 있으면 먼저 삭제
      await deleteGame(gameResultId);
    }
    // 3. 스케줄 삭제
    return deleteSchedule(id).then((data) => NextResponse.json(data));
  });
}
