import { getAllGames } from '@/service/games';
import { withSessionUser } from '@/util/session';
import { NextResponse } from 'next/server';

export async function GET() {
  return await withSessionUser(async () => {
    return getAllGames().then((data) => NextResponse.json(data));
  });
}
