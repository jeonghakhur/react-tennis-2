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
import { Container } from '@/components/Layout';
import LoadingGrid from '@/components/LoadingGrid';
import useSchedule from '@/hooks/useSchedule';
import { useRouter } from 'next/navigation';

interface Attendee {
  name: string;
  gender: string;
  startHour: string; // Format: "HH:mm"
  startMinute: string; // Format: "HH:mm"
  endHour: string; // Format: "HH:mm"
  endMinute: string; // Format: "HH:mm"
}

interface Match {
  id?: string;
  time: string;
  court: string;
  players: string[];
  score: string[];
}

interface MatchSchedulerProps {
  attendees: Attendee[];
  startTime: string; // Format: "HH:mm"
  endTime: string; // Format: "HH:mm"
  courts: number;
  courtNumbers: string[];
  scheduleId: string;
}

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
  const router = useRouter();

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
          new Date(
            `2023-01-01T${attendee.startHour}:${attendee.startMinute}`
          ) <= new Date(`2023-01-01T${slot}:00`) &&
          new Date(`2023-01-01T${slot}:00`) <
            new Date(`2023-01-01T${attendee.endHour}:${attendee.endMinute}`)
      );

      const playing: Attendee[] = [];

      for (let court = 1; court <= courts; court++) {
        if (available.length >= 4) {
          // console.log(available);
          shuffleArray(available);
          // 일반 복식 게임 생성
          const players = available
            .sort((a, b) => {
              if (gamesCount[a.name] !== gamesCount[b.name]) {
                return gamesCount[a.name] - gamesCount[b.name];
              }
              return a.gender.localeCompare(b.gender);
            })
            .slice(0, 4);

          // const men = players.filter((p) => p.gender === '남성');
          // const women = players.filter((p) => p.gender === '여성');

          // const orderedPlayers = [];

          // while (orderedPlayers.length < 4) {
          //   if (men.length > 0) orderedPlayers.push(men.shift());
          //   if (women.length > 0) orderedPlayers.push(women.shift());
          // }

          // orderedPlayers.forEach((player) => {
          //   gamesCount[player.name] += 1;
          //   playing.push(player);
          // });

          players.forEach((player) => {
            gamesCount[player.name] += 1;
            playing.push(player);
          });

          schedule.push({
            time: slot,
            court: court.toString(),
            players: players.map((p) => p.name),
            score: ['0', '0'],
          });
          players.forEach((p) => available.splice(available.indexOf(p), 1));
        }
      }
      idleByTime[slot] = available.map((p) => p.name);
    });

    setMatches(schedule);
    setIdleSummary(idleByTime);
    setGamesPlayed(gamesCount);
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
    fetch(`/api/match/${scheduleId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduleId, matches }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => router.push('/games'));
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
      </div>
    </div>
  );
};

type Props = {
  params: Promise<{ id: string }>; // params가 Promise로 감싸져 있음
};

export default function Page({ params }: Props) {
  const { id } = use(params);
  const { schedule, isLoading } = useSchedule(id);

  return (
    <Container>
      {isLoading && <LoadingGrid loading={isLoading} />}
      {!schedule ? (
        <div>등록된 데이터가 없습니다.</div>
      ) : (
        <TennisMatchScheduler
          attendees={schedule.attendees ?? []}
          startTime={schedule.startTime}
          endTime={schedule.endTime}
          courts={parseInt(schedule.courtCount, 10)}
          courtNumbers={schedule.courtNumbers}
          scheduleId={id}
        />
      )}
    </Container>
  );
}
