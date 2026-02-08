import { deleteUserById, getUserByUser, updateUserById } from '@/service/user';
import { withSessionUser } from '@/util/session';

import { NextRequest, NextResponse } from 'next/server';

const ADMIN_LEVEL = 4; // 레벨 4 이상만 회원 삭제 가능

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_: NextRequest, context: Context) {
  const { id } = await context.params;

  return withSessionUser(async () =>
    getUserByUser(id).then((data) => NextResponse.json(data))
  );
}

export async function PATCH(req: NextRequest, context: Context) {
  const { id } = await context.params;
  const body = await req.json();

  return withSessionUser(async () =>
    updateUserById(id, body).then((data) => NextResponse.json(data))
  );
}

export async function DELETE(_: NextRequest, context: Context) {
  const { id } = await context.params;

  return withSessionUser(async (user) => {
    if (user.level < ADMIN_LEVEL) {
      return NextResponse.json(
        { error: '회원 삭제 권한이 없습니다.' },
        { status: 403 }
      );
    }
    if (user.id === id) {
      return NextResponse.json(
        { error: '본인 계정은 삭제할 수 없습니다.' },
        { status: 400 }
      );
    }
    try {
      await deleteUserById(id);
      return NextResponse.json({ success: true });
    } catch (err) {
      console.error('회원 삭제 실패:', err);
      return NextResponse.json(
        { error: '회원 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }
  });
}
