import { AuthUser } from '@/model/user';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

/** 로그인된 사용자 중 레벨이 0이면 403 응답 반환, 아니면 null */
export async function rejectIfLevelZero(): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions);
  const level = session?.user?.level ?? 0;
  if (session && level < 1) {
    return NextResponse.json(
      { error: '레벨이 0인 사용자는 서비스를 이용할 수 없습니다.' },
      { status: 403 }
    );
  }
  return null;
}

export async function withSessionUser(
  handler: (user: AuthUser) => Promise<Response>
): Promise<Response> {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  const level = user?.level ?? 0;

  if (!user || level < 1) {
    return new Response(
      JSON.stringify({
        error:
          level === 0
            ? '레벨이 0인 사용자는 서비스를 이용할 수 없습니다.'
            : 'Authentication Error',
      }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return handler(user);
}
