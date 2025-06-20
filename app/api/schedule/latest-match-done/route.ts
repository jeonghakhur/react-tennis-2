import { getLatestMatchDoneSchedule } from '@/service/schedule';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const schedule = await getLatestMatchDoneSchedule();
    return NextResponse.json(schedule);
  } catch (error) {
    console.error('❌ 최근 match_done 스케줄 조회 중 오류:', error);
    return NextResponse.json(
      { error: '스케줄 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}
