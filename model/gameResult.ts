export interface Game {
  court: string; // 코트 번호
  players: string[]; // 참가자 이름 리스트
  score: string[]; // 경기 스코어 (팀별 점수)
  time: string; // 경기 시작 시간 (예: "19:00")
}

export interface GameResult {
  id?: string; // 문서 ID (선택적)
  scheduleID: string;
  courtName: string;
  date: string;
  author: string;
  games: Game[]; // 경기 목록
}
