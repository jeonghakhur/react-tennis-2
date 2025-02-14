/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Attendee {
  name: string;
  gender: string;
  startTime: string; // Format: "HH:mm"
  endTime: string; // Format: "HH:mm"
}

interface Match {
  time: string;
  court: number;
  players: string[];
  score: string[];
}

interface MatchSchedulerProps {
  attendees: Attendee[];
  startTime: string; // Format: "HH:mm"
  endTime: string; // Format: "HH:mm"
  courts: number;
  scheduleId: string;
}

const data = {
  date: '2025-01-14T15:00:00.000Z',
  startTime: '19',
  endTime: '22',
  courtName: '망원한강공원',
  courtCount: '3',
  courtNumbers: ['1', '2'],
  attendees: [
    { name: '이현우', gender: '남성', startTime: '19:30', endTime: '22:00' },
    { name: '장진석', gender: '남성', startTime: '19:30', endTime: '22:00' },
    { name: '이현철', gender: '남성', startTime: '19:00', endTime: '22:30' },
    { name: '하지원', gender: '여성', startTime: '19:30', endTime: '22:00' },
    { name: '전소빈', gender: '여성', startTime: '19:00', endTime: '22:00' },
    { name: '윤슬', gender: '여성', startTime: '19:00', endTime: '22:00' },
    { name: '신광호', gender: '남성', startTime: '19:00', endTime: '21:30' },
    { name: '진형록', gender: '남성', startTime: '19:30', endTime: '22:00' },
    { name: '김유진', gender: '여성', startTime: '19:00', endTime: '22:00' },
    { name: '윤문환', gender: '남성', startTime: '20:00', endTime: '22:00' },
  ],
};

function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // 0부터 i까지 랜덤한 인덱스 선택
    [array[i], array[j]] = [array[j], array[i]]; // swap
  }
  return array;
}

const TennisMatchScheduler: React.FC<MatchSchedulerProps> = ({
  attendees,
  startTime,
  endTime,
  courts,
  scheduleId,
}) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [idleSummary, setIdleSummary] = useState<Record<string, string[]>>({});
  const [gamesPlayed, setGamesPlayed] = useState<Record<string, number>>({});
  const [activePopoverId, setActivePopoverId] = useState<string | null>(null);
  const womenFirst = false;

  const generateSchedule = useCallback(() => {
    shuffleArray(attendees);
    const timeSlots: string[] = [];
    let currentTime = new Date(`2023-01-01T${startTime}:00`);
    const end = new Date(`2023-01-01T${endTime}:00`);

    while (currentTime < end) {
      timeSlots.push(currentTime.toTimeString().slice(0, 5));
      currentTime = new Date(currentTime.getTime() + 30 * 60 * 1000); // Increment by 30 minutes
    }

    const schedule: Match[] = [];
    const idleByTime: Record<string, string[]> = {};
    const gamesCount: Record<string, number> = {};

    attendees.forEach((attendee) => (gamesCount[attendee.name] = 0));

    timeSlots.forEach((slot) => {
      const available = attendees.filter(
        (attendee) =>
          new Date(`2023-01-01T${attendee.startTime}:00`) <=
            new Date(`2023-01-01T${slot}:00`) &&
          new Date(`2023-01-01T${slot}:00`) <
            new Date(`2023-01-01T${attendee.endTime}:00`)
      );

      const playing: Attendee[] = [];

      const availableWomen = available.filter((a) => a.gender === '여성');

      for (let court = 1; court <= courts; court++) {
        if (womenFirst && availableWomen.length >= 4) {
          // 여복 게임 생성
          const womenPlayers = availableWomen
            .sort((a, b) => gamesCount[a.name] - gamesCount[b.name])
            .slice(0, 4)
            .sort(() => Math.random() - 0.5);
          womenPlayers.forEach((player) => {
            gamesCount[player.name] += 1;
            playing.push(player);
          });
          schedule.push({
            time: slot,
            court,
            players: womenPlayers.map((p) => p.name),
            score: ['0', '0'],
          });
          womenPlayers.forEach((p) => {
            availableWomen.splice(availableWomen.indexOf(p), 1);
            available.splice(available.indexOf(p), 1);
          });
        } else if (available.length >= 4) {
          // 일반 복식 게임 생성
          const players = available
            .sort((a, b) => gamesCount[a.name] - gamesCount[b.name])
            .slice(0, 4);

          players.forEach((player) => {
            gamesCount[player.name] += 1;
            playing.push(player);
          });
          schedule.push({
            time: slot,
            court,
            players: players.map((p) => p.name),
            score: ['0', '0'],
          });
          players.forEach((p) => available.splice(available.indexOf(p), 1));
        }
      }

      // const newIdle = [...new Set([...])]; // 중복 제거 및 최대 5명
      idleByTime[slot] = available.map((p) => p.name);
      // idlePool = newIdle;
    });

    setMatches(schedule);
    setIdleSummary(idleByTime);
    setGamesPlayed(gamesCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attendees, startTime, endTime, courts]);

  useEffect(() => {
    generateSchedule();
  }, [generateSchedule]);

  const handlePlayersChange = useCallback(
    (player: string, matchIndex: number, playerIndex: number) => {
      const updateMatches = [...matches];
      const prevName = updateMatches[matchIndex].players[playerIndex];
      const prevIndex = updateMatches[matchIndex].players.findIndex(
        (item) => item === player
      );

      // 교체 작업
      updateMatches[matchIndex].players[playerIndex] = player;
      if (prevName) {
        updateMatches[matchIndex].players[prevIndex] = prevName;
      }

      if (prevIndex !== -1) {
        updateMatches[matchIndex].players[prevIndex] = '';
      }

      // 대기자 업데이트
      const matchTime = updateMatches[matchIndex].time;
      const updateIdleSummary = { ...idleSummary };

      const idleIndex = updateIdleSummary[matchTime]?.findIndex(
        (item) => item === player
      );
      if (idleIndex !== -1) {
        const updateGamesCount = { ...gamesPlayed };
        updateGamesCount[player] += 1;

        if (prevName) {
          updateIdleSummary[matchTime] = [
            ...updateIdleSummary[matchTime].slice(0, idleIndex),
            prevName,
            ...updateIdleSummary[matchTime].slice(idleIndex + 1),
          ];
          updateGamesCount[prevName] -= 1;
        } else {
          updateIdleSummary[matchTime].splice(idleIndex, 1);
        }

        setGamesPlayed(updateGamesCount);
      }

      setMatches(updateMatches);
      setIdleSummary(updateIdleSummary);
      setActivePopoverId(null);
    },
    [gamesPlayed, idleSummary, matches]
  );

  const handleScoreChange = useCallback(
    (value: string, matchIndex: number, scoreIndex: number) => {
      const updateMatches = [...matches];
      updateMatches[matchIndex].score[scoreIndex] = value;
      setMatches(updateMatches);
    },
    [matches]
  );

  const handleRegenerate = () => {
    generateSchedule();
  };

  const handleMatchesReset = () => {
    const updateMatches = [...matches];
    if (updateMatches[0].players.length === 0) {
      alert('초기화 상태입니다.');
      return;
    }
    const updateIdleSummary = { ...idleSummary };

    updateMatches.forEach((item) => {
      item.players.forEach((player) => {
        updateIdleSummary[item.time].push(player);
      });
    });
    updateMatches.map((item) => (item.players = []));
    const resetState = Object.keys(gamesPlayed).reduce<Record<string, number>>(
      (acc, key) => {
        acc[key] = 0;
        return acc;
      },
      {}
    );

    setIdleSummary(updateIdleSummary);
    setMatches(updateMatches);
    setGamesPlayed(resetState);
  };

  const handleSubmit = () => {
    fetch(`/api/games/${scheduleId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduleId, matches }),
    })
      .then((res) => res.json())
      .then((data) => console.log(data))
      .catch((error) => {
        console.error(error);
      })
      .finally(() => console.log('succes'));
  };

  const attendessAtTime = (time: string, name: string) => {
    const attendessPlayers = matches
      .filter((match) => match.time === time)
      .flatMap((match) => match.players)
      .filter((player) => player !== name && player !== '');
    const idleplayers = idleSummary[time];
    return [...attendessPlayers, ...idleplayers];
  };

  type AttendeePopoverProp = {
    matchIndex: number;
    match: Match;
    playerIndex: number;
  };

  const AttendeePopover: React.FC<AttendeePopoverProp> = ({
    matchIndex,
    match,
    playerIndex,
  }) => {
    return (
      <Popover
        open={activePopoverId === `popover${matchIndex}${playerIndex}`}
        onOpenChange={(isOpen) =>
          setActivePopoverId(
            isOpen ? `popover${matchIndex}${playerIndex}` : null
          )
        }
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="my-1 w-[80px] text-xs py-1 px-2"
          >
            {match.players[playerIndex] || '선택'}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[180px]">
          <Command>
            <CommandInput placeholder="Search member" />
            <CommandList>
              <CommandEmpty>No member found.</CommandEmpty>
              <CommandGroup>
                {attendessAtTime(match.time, match.players[playerIndex]).map(
                  (player, idx) => (
                    <CommandItem
                      key={`${player}-${idx}`}
                      value={player}
                      onSelect={(currentValue) => {
                        handlePlayersChange(
                          currentValue,
                          matchIndex,
                          playerIndex
                        );
                      }}
                    >
                      {player}
                      <Check
                        className={cn(
                          'ml-auto',
                          player === match.players[playerIndex]
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                  )
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };

  type MatchRowProps = {
    rowspan: number;
    isFirstMatch: boolean;
  } & Omit<AttendeePopoverProp, 'playerIndex'>;

  const MatchRow = React.memo(
    ({ match, matchIndex, rowspan, isFirstMatch }: MatchRowProps) => {
      return (
        <tr>
          {isFirstMatch && (
            <td rowSpan={rowspan} className="text-xxs">
              {match.time}
            </td>
          )}
          <td className="text-xxs">{match.court}</td>
          <td className="p-0">
            <div className="flex flex-col">
              <div className="flex gap-x-1 justify-center border-b-[1px]">
                <AttendeePopover
                  matchIndex={matchIndex}
                  match={match}
                  playerIndex={0}
                />
                <AttendeePopover
                  matchIndex={matchIndex}
                  match={match}
                  playerIndex={1}
                />
              </div>
              <div className="flex gap-x-1 justify-center">
                <AttendeePopover
                  matchIndex={matchIndex}
                  match={match}
                  playerIndex={2}
                />
                <AttendeePopover
                  matchIndex={matchIndex}
                  match={match}
                  playerIndex={3}
                />
              </div>
            </div>
          </td>
          <td className="p-0">
            <div className="px-1 border-b-[1px]">
              <Select
                defaultValue={match.score[0]}
                onValueChange={(value) =>
                  handleScoreChange(value, matchIndex, 0)
                }
              >
                <SelectTrigger className="text-xs my-1 pr-1" value="0">
                  <SelectValue>{match.score[0]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 7 }, (_, i) => (
                    <SelectItem
                      value={i.toString()}
                      key={i}
                      className="text-xs"
                    >
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="px-1">
              <Select
                defaultValue={match.score[1]}
                onValueChange={(value) =>
                  handleScoreChange(value, matchIndex, 1)
                }
              >
                <SelectTrigger className="text-xs my-1 pr-1">
                  <SelectValue>{match.score[1]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 7 }, (_, i) => (
                    <SelectItem
                      value={i.toString()}
                      key={i}
                      className="text-xs"
                    >
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </td>
          {isFirstMatch && (
            <td rowSpan={rowspan} className="text-xs">
              {idleSummary[match.time] && idleSummary[match.time].length > 0
                ? idleSummary[match.time].map((item, idx) => (
                    <div key={idx}>{item}</div>
                  ))
                : ''}
            </td>
          )}
        </tr>
      );
    }
  );

  MatchRow.displayName = 'MatchRow';

  return (
    <div className="p-5">
      <h1>Tennis Match Scheduler</h1>

      <h2>Match Schedule</h2>
      <table className="table">
        <thead>
          <tr>
            <th>시간</th>
            <th>코트</th>
            <th>페어</th>
            <th>스코어</th>

            <th>대기자</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match, index) => {
            // 현재 시간의 첫 번째 경기인지 확인
            const isFirstMatch =
              index === 0 || matches[index - 1].time !== match.time;
            // 해당 시간대의 경기 수 계산
            const rowspan = matches.filter((m) => m.time === match.time).length;
            return (
              <MatchRow
                key={index}
                match={match}
                matchIndex={index}
                rowspan={rowspan}
                isFirstMatch={isFirstMatch}
              />
            );
          })}
        </tbody>
      </table>

      <h2>Games Played</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Player</th>
            <th>Games Played</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(gamesPlayed).map(([player, count], index) => (
            <tr key={index}>
              <td>{player}</td>
              <td>{count}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="button-group">
        <Button onClick={handleRegenerate} size="lg" className="">
          대진 새로고침
        </Button>
        <Button onClick={handleMatchesReset} size="lg" variant="default">
          대진 직접작성
        </Button>
        <Button
          onClick={() => handleSubmit()}
          size="lg"
          className="bg-blue-600"
        >
          저장
        </Button>
        <Button onClick={() => handleSubmit()} size="lg" variant="destructive">
          삭제
        </Button>
      </div>
    </div>
  );
};

type Props = {
  params: Promise<{ id: string }>; // params가 Promise로 감싸져 있음
};

export default function Page({ params }: Props) {
  const { id } = use(params);

  return (
    <div className="pb-20">
      <TennisMatchScheduler
        attendees={data.attendees}
        startTime={data.startTime}
        endTime={data.endTime}
        courts={parseInt(data.courtCount, 10)}
        scheduleId={id}
      />
    </div>
  );
}
