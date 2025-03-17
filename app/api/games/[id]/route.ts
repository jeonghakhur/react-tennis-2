import {
  createGameResult,
  deleteGame,
  getGame,
  updateGameResult,
} from '@/service/games';
import { withSessionUser } from '@/util/session';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  return await withSessionUser(async (user) => {
    const { scheduleId, matches } = await req.json();

    const game = await getGame(scheduleId);

    if (game) {
      return updateGameResult(game._id, matches).then((data) =>
        NextResponse.json(data)
      );
    } else {
      return createGameResult(scheduleId, user.id, matches).then((data) =>
        NextResponse.json(data)
      );
    }
  });
}

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_: NextRequest, context: Context) {
  const { id } = await context.params; // params를 비동기로 처리

  return withSessionUser(async () =>
    getGame(id) //
      .then((data) => NextResponse.json(data))
  );
}

export async function DELETE(_: NextRequest, context: Context) {
  const { id } = await context.params;

  return withSessionUser(async () =>
    deleteGame(id).then((data) => NextResponse.json(data))
  );
}
