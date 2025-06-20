import { getAllGames } from '@/service/games';
import { withSessionUser } from '@/util/session';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return await withSessionUser(async () => {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    return getAllGames(status).then((data) => NextResponse.json(data));
  });
}
