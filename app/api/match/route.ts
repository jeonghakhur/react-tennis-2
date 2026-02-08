import { getAllGames } from '@/service/games';
import { rejectIfLevelZero } from '@/util/session';
import { NextResponse } from 'next/server';

export async function GET() {
  const forbidden = await rejectIfLevelZero();
  if (forbidden) return forbidden;
  return getAllGames().then((data) => NextResponse.json(data));
}
