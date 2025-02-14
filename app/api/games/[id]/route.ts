import { createGameResult } from '@/service/games';
import { withSessionUser } from '@/util/session';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  return await withSessionUser(async (user) => {
    const { scheduleId, matches } = await req.json();

    return createGameResult(scheduleId, user.id, matches).then((data) =>
      NextResponse.json(data)
    );
  });
}
