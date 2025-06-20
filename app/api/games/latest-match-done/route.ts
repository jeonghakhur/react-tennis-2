import { getLatestMatchDoneGame } from '@/service/games';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const gameResult = await getLatestMatchDoneGame();
    return NextResponse.json(gameResult);
  } catch (error) {
    console.error('❌ 최근 match_done 게임 조회 중 오류:', error);
    return NextResponse.json(
      { error: '게임 데이터 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}
