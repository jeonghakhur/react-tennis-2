import { Fragment } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Game } from '@/model/gameResult';
import { AttendanceProps } from '@/model/schedule';

interface MatchPrintPageContentProps {
  matchData:
    | {
        games: Game[];
        courtNumbers: { number: string }[];
        attendees: AttendanceProps[];
        courtName?: string | undefined;
        date?: string | undefined;
      }
    | null
    | undefined;
  isLoading?: boolean;
  className?: string;
}

export default function MatchPrintPageContent({
  matchData,
  isLoading,
  className,
}: MatchPrintPageContentProps) {
  // 코트별 배경색 팔레트 (최대 4개)
  const courtColors = [
    'bg-blue-50',
    'bg-green-50',
    'bg-yellow-50',
    'bg-pink-50',
  ];

  if (isLoading) return <div>로딩중...</div>;
  if (!matchData) return <div>데이터 없음</div>;

  // 시간/코트별로 실제 데이터 출력
  const games: Game[] = matchData.games || [];
  // 시간, 코트별로 정렬
  const timeSet = Array.from(new Set(games.map((g) => g.time))).sort();
  // courtSet: 실제 사용 가능한 코트 번호만 추출
  const courtSet: string[] = Array.isArray(matchData.courtNumbers)
    ? matchData.courtNumbers.map((c: { number: string }) => c.number)
    : ['1', '2', '3', '4'];
  // 전체 참석자 리스트
  const attendees: AttendanceProps[] = Array.isArray(matchData.attendees)
    ? matchData.attendees
    : [];

  // 참석자별 게임수 및 남복/여복/혼복 출전 횟수, 게임 시간, 대기수 계산
  type GameType = '남복' | '여복' | '혼복';
  type PlayerGameStats = {
    total: number;
    남복: number;
    여복: number;
    혼복: number;
    times: { time: string; court: string }[];
    waiting: number;
  };
  const playerGameStats: Record<string, PlayerGameStats> = {};
  attendees.forEach((a: { name: string }) => {
    playerGameStats[a.name] = {
      total: 0,
      남복: 0,
      여복: 0,
      혼복: 0,
      times: [],
      waiting: 0,
    };
  });
  games.forEach((g: { players?: string[]; time?: string; court?: string }) => {
    if (!g.players || g.players.length < 4) return;
    // gender 변환: '남성'→'남', '여성'→'여'
    const genders = g.players.map((name) => {
      const found = attendees.find(
        (a: { name: string; gender?: string }) => a.name === name
      );
      if (found?.gender === '남성') return '남';
      if (found?.gender === '여성') return '여';
      return found?.gender || '';
    });
    let type: GameType = '혼복';
    const maleCount = genders.filter((g) => g === '남').length;
    const femaleCount = genders.filter((g) => g === '여').length;
    if (maleCount === 4) type = '남복';
    else if (femaleCount === 4) type = '여복';
    else type = '혼복';
    g.players.forEach((name) => {
      if (playerGameStats[name]) {
        playerGameStats[name].total++;
        playerGameStats[name][type]++;
        if (g.time && g.court)
          playerGameStats[name].times.push({ time: g.time, court: g.court });
      }
    });
  });
  // 대기수 계산: 각 참석자가 실제 참석 가능한 시간 슬롯 - 출전 게임수
  Object.keys(playerGameStats).forEach((name) => {
    const attendee = attendees.find((a) => a && a.name === name);
    if (
      playerGameStats[name] &&
      attendee &&
      attendee.startHour &&
      attendee.startMinute &&
      attendee.endHour &&
      attendee.endMinute
    ) {
      const startHour = String(attendee.startHour).padStart(2, '0');
      const startMinute = String(attendee.startMinute).padStart(2, '0');
      const endHour = String(attendee.endHour).padStart(2, '0');
      const endMinute = String(attendee.endMinute).padStart(2, '0');
      const availableSlots = timeSet.filter((time) => {
        const start = new Date(`2023-01-01T${startHour}:${startMinute}`);
        const end = new Date(`2023-01-01T${endHour}:${endMinute}`);
        const slot = new Date(`2023-01-01T${time}:00`);
        return start <= slot && slot < end;
      });
      playerGameStats[name].waiting =
        availableSlots.length - playerGameStats[name].total;
    } else if (playerGameStats[name]) {
      playerGameStats[name].waiting = 0;
    }
  });

  // 남성/여성 참석자 분리
  const maleAttendees = attendees.filter(
    (a) => a.gender === '남' || a.gender === '남성'
  );
  const femaleAttendees = attendees.filter(
    (a) => a.gender === '여' || a.gender === '여성'
  );

  return (
    <div>
      {/* 코트장소, 날짜/요일 */}
      <div className={`print-area print-visible ${className}`}>
        <h1 className="text-sx font-bold text-center mb-2">
          {matchData.courtName && <span>{matchData.courtName} | </span>}
          {matchData.date && (
            <span>
              {format(new Date(matchData.date), 'yyyy-MM-dd (EEE)', {
                locale: ko,
              })}
            </span>
          )}
        </h1>
        <div className="overflow-x-auto pr-[1px]">
          <table className="w-full border text-center font-bold table-2 text-xs">
            <thead>
              <tr>
                <th className="border p-2">시간</th>
                {courtSet.map((court) => (
                  <th key={court} className="border p-2" colSpan={4}>
                    {court}번
                  </th>
                ))}
                <th className="border p-2">대기자</th>
              </tr>
            </thead>
            <tbody>
              {timeSet.map((time) => {
                const rowGames = courtSet.map((court: string) =>
                  games.find(
                    (g: { time: string; court: string }) =>
                      g.time === time && g.court === court
                  )
                );
                const playing = rowGames.flatMap((g) => g?.players ?? []);
                const waiting = attendees
                  .filter(
                    (a: {
                      startHour: string;
                      startMinute: string;
                      endHour: string;
                      endMinute: string;
                    }) => {
                      const start = new Date(
                        `2023-01-01T${a.startHour}:${a.startMinute}`
                      );
                      const end = new Date(
                        `2023-01-01T${a.endHour}:${a.endMinute}`
                      );
                      const slot = new Date(`2023-01-01T${time}:00`);
                      return start <= slot && slot < end;
                    }
                  )
                  .map((a) => a.name)
                  .filter((name) => !playing.includes(name));
                return (
                  <Fragment key={time}>
                    <tr key={time}>
                      <td className="border p-2" rowSpan={2}>
                        {time}
                      </td>
                      {rowGames.map((_, idx) => {
                        if (
                          !rowGames[idx] ||
                          !rowGames[idx].players ||
                          rowGames[idx].players.length < 4
                        ) {
                          return (
                            <td
                              key={idx}
                              className={`border p-0 whitespace-nowrap ${courtColors[idx % courtColors.length]}`}
                              colSpan={4}
                            />
                          );
                        }
                        const pair1 = rowGames[idx].players
                          .slice(0, 2)
                          .join('/');
                        const pair2 = rowGames[idx].players
                          .slice(2, 4)
                          .join('/');
                        return (
                          <Fragment key={idx}>
                            <td
                              className={`p-2 whitespace-nowrap  ${courtColors[idx % courtColors.length]}`}
                            >
                              {pair1}
                            </td>
                            <td
                              className={`px-4 ${courtColors[idx % courtColors.length]}`}
                            ></td>
                            <td
                              className={`px-4 ${courtColors[idx % courtColors.length]}`}
                            ></td>
                            <td
                              className={`p-2 whitespace-nowrap ${courtColors[idx % courtColors.length]}`}
                            >
                              {pair2}
                            </td>
                          </Fragment>
                        );
                      })}
                      <td className="border p-2 whitespace-nowrap" rowSpan={2}>
                        {Array.isArray(waiting) && waiting.length > 0
                          ? Array.from({
                              length: Math.ceil(waiting.length / 2),
                            }).map((_, idx) => (
                              <span key={idx}>
                                {waiting.slice(idx * 2, idx * 2 + 2).join(', ')}
                                {idx < Math.ceil(waiting.length / 2) - 1 && (
                                  <br />
                                )}
                              </span>
                            ))
                          : waiting}
                      </td>
                    </tr>
                    <tr>
                      {rowGames.map((_, idx) => (
                        <Fragment key={idx}>
                          <td
                            className={` ${courtColors[idx % courtColors.length]} text-transparent`}
                          >
                            {' - '}
                          </td>
                          <td
                            className={`${courtColors[idx % courtColors.length]}`}
                          ></td>
                          <td
                            className={`${courtColors[idx % courtColors.length]}`}
                          ></td>
                          <td
                            className={`${courtColors[idx % courtColors.length]}`}
                          ></td>
                        </Fragment>
                      ))}
                    </tr>
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex gap-2 overflow-x-auto mt-4">
          <div className="flex-1">
            <h2 className="font-bold mb-2 text-center text-blue-700">
              남성 참석자별 게임수/시간/코트/대기
            </h2>
            <table className="w-full border text-center table-2 text-xs whitespace-nowrap ">
              <thead>
                <tr>
                  <th className="border">이름</th>
                  <th className="border">전체</th>
                  <th className="border">남복</th>
                  <th className="border">혼복</th>
                  <th className="border">게임시간/코트</th>
                  <th className="border">대기수</th>
                </tr>
              </thead>
              <tbody>
                {maleAttendees.map((a) => (
                  <tr key={a.name}>
                    <td className="border">{a.name}</td>
                    <td className="border">
                      {playerGameStats[a.name]?.total ?? 0}
                    </td>
                    <td className="border">
                      {playerGameStats[a.name]?.남복 ?? 0}
                    </td>
                    <td className="border">
                      {playerGameStats[a.name]?.혼복 ?? 0}
                    </td>
                    <td className="border text-left">
                      {playerGameStats[a.name]?.times
                        .map((t) => `${t.time}(${t.court})`)
                        .join(', ')}
                    </td>
                    <td className="border">
                      {playerGameStats[a.name]?.waiting ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* 참석자별 게임수 표 - 여성 */}
          <div className="flex-1 pr-[1px]">
            <h2 className="font-bold mb-2 text-center text-pink-700">
              여성 참석자별 게임수/시간/코트/대기
            </h2>
            <table className="w-full border text-center table-2 text-xs whitespace-nowrap">
              <thead>
                <tr>
                  <th className="border">이름</th>
                  <th className="border">전체</th>
                  <th className="border">여복</th>
                  <th className="border">혼복</th>
                  <th className="border">게임시간/코트</th>
                  <th className="border">대기수</th>
                </tr>
              </thead>
              <tbody>
                {femaleAttendees.map((a) => (
                  <tr key={a.name}>
                    <td className="border">{a.name}</td>
                    <td className="border">
                      {playerGameStats[a.name]?.total ?? 0}
                    </td>
                    <td className="border">
                      {playerGameStats[a.name]?.여복 ?? 0}
                    </td>
                    <td className="border">
                      {playerGameStats[a.name]?.혼복 ?? 0}
                    </td>
                    <td className="border text-left">
                      {playerGameStats[a.name]?.times
                        .map((t) => `${t.time}(${t.court})`)
                        .join(', ')}
                    </td>
                    <td className="border">
                      {playerGameStats[a.name]?.waiting ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="print-hidden pb-20">{''}</div>
    </div>
  );
}
