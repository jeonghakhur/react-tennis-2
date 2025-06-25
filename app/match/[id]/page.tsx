/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Container } from '@/components/Layout';
import LoadingGrid from '@/components/LoadingGrid';
import useSchedule from '@/hooks/useSchedule';
import { useRouter } from 'next/navigation';
import { useSWRConfig } from 'swr';
import { useRef } from 'react';
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
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

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
  courtNumbers: { _key: string; number: string }[];
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
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { mutate } = useSWRConfig();
  const [showScore, setShowScore] = useState(false);
  const [scheduleStatus, setScheduleStatus] = useState<
    'pending' | 'attendees_done' | 'match_done' | 'game_done'
  >('attendees_done');

  // 대기자 정보 계산 함수
  const calculateIdleSummary = useCallback(
    (gameMatches: Match[]) => {
      const timeSlots: string[] = [];
      let currentTime = new Date(`2023-01-01T${startTime}:00`);
      const end = new Date(`2023-01-01T${endTime}:00`);

      while (currentTime < end) {
        timeSlots.push(currentTime.toTimeString().slice(0, 5));
        currentTime = new Date(currentTime.getTime() + 30 * 60 * 1000);
      }

      const idleByTime: Record<string, string[]> = {};

      timeSlots.forEach((slot) => {
        const playingAtTime = gameMatches
          .filter((match) => match.time === slot)
          .flatMap((match) => match.players);

        const available = attendees.filter(
          (attendee) =>
            new Date(
              `2023-01-01T${attendee.startHour}:${attendee.startMinute}`
            ) <= new Date(`2023-01-01T${slot}:00`) &&
            new Date(`2023-01-01T${slot}:00`) <
              new Date(`2023-01-01T${attendee.endHour}:${attendee.endMinute}`)
        );

        idleByTime[slot] = available
          .map((attendee) => attendee.name)
          .filter((name) => !playingAtTime.includes(name));
      });

      setIdleSummary(idleByTime);
    },
    [attendees, startTime, endTime]
  );

  // 게임 플레이 횟수 계산 함수
  const calculateGamesPlayed = useCallback(
    (gameMatches: Match[]) => {
      const gamesCount: Record<string, number> = {};

      attendees.forEach((attendee) => {
        gamesCount[attendee.name] = 0;
      });

      gameMatches.forEach((match) => {
        match.players.forEach((player) => {
          if (gamesCount[player] !== undefined) {
            gamesCount[player]++;
          }
        });
      });

      setGamesPlayed(gamesCount);
    },
    [attendees]
  );

  const generateSchedule = useCallback(() => {
    shuffleArray(attendees);
    const timeSlots: string[] = [];
    let currentTime = new Date(`2023-01-01T${startTime}:00`);
    const end = new Date(`2023-01-01T${endTime}:00`);

    while (currentTime < end) {
      timeSlots.push(currentTime.toTimeString().slice(0, 5));
      currentTime = new Date(currentTime.getTime() + 30 * 60 * 1000);
    }

    const initial: Record<string, string[]> = {};
    timeSlots.forEach((slot) => {
      initial[slot] = [];
    });
    setIdleSummary(initial);

    const schedule: Match[] = [];
    const idleByTime: Record<string, string[]> = {};
    const gamesCount: Record<string, number> = {};

    attendees.forEach((attendee) => {
      gamesCount[attendee.name] = 0;
    });

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
          shuffleArray(available);
          const players = available
            .sort((a, b) => {
              const countA = gamesCount[a.name] || 0;
              const countB = gamesCount[b.name] || 0;
              if (countA !== countB) {
                return countA - countB;
              }
              return a.gender.localeCompare(b.gender);
            })
            .slice(0, 4);

          players.forEach((player) => {
            gamesCount[player.name] = (gamesCount[player.name] || 0) + 1;
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

  // 기존 게임 데이터 가져오기
  useEffect(() => {
    const fetchExistingGame = async () => {
      try {
        console.log('🔄 매치 페이지 로드 - 스케줄 ID:', scheduleId);
        const response = await fetch(`/api/match/${scheduleId}`);
        if (response.ok) {
          const gameData = await response.json();
          console.log('📊 기존 게임 데이터:', gameData);
          console.log('🔍 스케줄 상태 확인:', {
            scheduleStatus: gameData?.scheduleStatus,
            hasScheduleStatus: !!gameData?.scheduleStatus,
            type: typeof gameData?.scheduleStatus,
          });

          if (gameData && gameData.games && gameData.games.length > 0) {
            console.log('✅ 기존 게임 데이터 발견 - 대진 복원');
            // 기존 게임 데이터가 있으면 해당 대진을 설정
            setMatches(gameData.games);
            // 기존 게임 데이터의 스케줄 상태를 설정
            const currentStatus = gameData.scheduleStatus || 'attendees_done';
            setScheduleStatus(currentStatus);
            console.log('🎯 설정된 스케줄 상태:', currentStatus);
            console.log(
              '🎯 Switch 상태:',
              currentStatus === 'match_done' ? 'ON' : 'OFF'
            );

            // 대기자 정보 계산
            calculateIdleSummary(gameData.games);
            calculateGamesPlayed(gameData.games);
          } else {
            console.log('🆕 기존 게임 데이터 없음 - 새 대진 생성');
            // 기존 데이터가 없으면 새로 생성
            generateSchedule();
          }
        } else {
          console.log('❌ API 호출 실패 - 새 대진 생성');
          // API 호출 실패 시 새로 생성
          generateSchedule();
        }
      } catch (error) {
        console.error('❌ 기존 게임 데이터 조회 실패:', error);
        generateSchedule();
      }
    };

    fetchExistingGame();
  }, [
    scheduleId,
    calculateIdleSummary,
    calculateGamesPlayed,
    generateSchedule,
  ]);

  const handlePlayersChange = useCallback(
    (
      player: string,
      time: string,
      prePlayer: string,
      playerIndex: number,
      matchIndex?: number
    ) => {
      const updateMatches = [...matches];
      const sameTimeMatches = updateMatches.filter((m) => m.time === time);

      if (prePlayer) {
        sameTimeMatches.forEach((match) => {
          match.players = match.players.map((name) => {
            if (name === player) return prePlayer;
            if (name === prePlayer) return player;
            return name;
          });
        });
      } else if (typeof matchIndex === 'number') {
        // prePlayer가 없으면 matchIndex에 해당하는 매치의 playerIndex 위치에만 player를 넣어줌
        const match = updateMatches[matchIndex];
        if (match) {
          match.players[playerIndex] = player;
        }
      }

      console.log(updateMatches, idleSummary);

      // 대기자 업데이트
      const updateIdleSummary = { ...idleSummary };

      const idleIndex = updateIdleSummary[time]?.findIndex(
        (item) => item === player
      );

      console.log('idleIndex', idleIndex);

      if (idleIndex !== -1 && typeof idleIndex === 'number') {
        const updateGamesCount = { ...gamesPlayed };
        updateGamesCount[player] = (updateGamesCount[player] || 0) + 1;

        if (prePlayer) {
          if (!updateIdleSummary[time]) {
            updateIdleSummary[time] = [];
          }
          updateIdleSummary[time] = [
            ...updateIdleSummary[time].slice(0, idleIndex),
            prePlayer,
            ...updateIdleSummary[time].slice(idleIndex + 1),
          ];
          updateGamesCount[prePlayer] = (updateGamesCount[prePlayer] || 0) - 1;
        } else if (updateIdleSummary[time]) {
          updateIdleSummary[time].splice(idleIndex, 1);
        }

        setGamesPlayed(updateGamesCount);
      }

      setMatches(updateMatches);
      setIdleSummary(updateIdleSummary);
    },
    [gamesPlayed, idleSummary, matches]
  );

  const handleScoreChange = useCallback(
    (value: string, matchIndex: number, scoreIndex: number) => {
      const updateMatches = [...matches];
      const match = updateMatches[matchIndex];
      if (!match) return;

      match.score[scoreIndex] = value;
      setMatches(updateMatches);
      setTimeout(() => {
        const button = document.querySelector(
          `button[data-match-index="${matchIndex}"][data-score-index="${scoreIndex}"]`
        ) as HTMLButtonElement;
        if (button) {
          button.focus();
        }
      }, 0);
    },
    [matches]
  );

  const handleRegenerate = () => {
    generateSchedule();
  };

  const handleMatchesReset = () => {
    const updateMatches = [...matches];
    const firstMatch = updateMatches[0];
    if (!firstMatch || firstMatch.players.length === 0) {
      alert('초기화 상태입니다.');
      return;
    }

    const updateIdleSummary = { ...idleSummary };
    updateMatches.forEach((item) => {
      if (!item || !item.time) return;
      const time = item.time;
      item.players.forEach((player) => {
        if (!updateIdleSummary[time]) {
          updateIdleSummary[time] = [];
        }
        updateIdleSummary[time].push(player);
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
    console.log(updateMatches);
    setGamesPlayed(resetState);
  };

  const handleSubmit = async () => {
    setLoading(true);
    console.log('💾 대진표 저장 시작');
    console.log('📋 저장할 대진 데이터:', matches);
    console.log('🎯 저장할 스케줄 상태:', scheduleStatus);

    try {
      const response = await fetch(`/api/match/${scheduleId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduleId, matches, status: scheduleStatus }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ 대진표 저장 성공:', data);

      // SWR 캐시 무효화 후 페이지 이동
      await mutate('/api/games', undefined, { revalidate: true });

      // 잠시 대기하여 데이터 로드 완료 보장
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 성공 시 페이지 이동
      console.log('🔄 스케줄 목록 페이지로 이동');
      router.push('/schedule');
    } catch (error) {
      console.error('❌ 대진표 저장 중 오류:', error);

      // 에러 발생 시 사용자에게 알림
      alert('대진표 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const attendessAtTime = (time: string) => {
    const attendessPlayers = matches
      .filter((match) => match.time === time)
      .flatMap((match) => match.players);

    const idleplayers = idleSummary[time] || [];
    return [...attendessPlayers, ...idleplayers];
  };

  type PlayerAutocompleteProp = {
    matchIndex: number;
    match: Match;
    playerIndex: number;
  };

  const PopoverCommand: React.FC<PlayerAutocompleteProp> = ({
    matchIndex,
    match,
    playerIndex,
  }) => {
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [memberValue, setMemberValue] = useState(match.players[playerIndex]);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const players = match?.time
      ? match?.players?.[playerIndex]
        ? attendessAtTime(match.time)
        : idleSummary[match.time] || []
      : [];

    // 참석자 이름 오름차순 정렬
    const sortedPlayers = [...players].sort((a, b) => a.localeCompare(b, 'ko'));

    const handleSelect = (value: string) => {
      setMemberValue(value);
      handlePlayersChange(
        value,
        match.time,
        memberValue || '',
        playerIndex,
        matchIndex
      );
      // Popover를 닫기 전에 포커스 설정
      setTimeout(() => {
        const button = document.querySelector(
          `button[data-match-index="${matchIndex}"][data-player-index="${playerIndex}"]`
        ) as HTMLButtonElement;
        if (button) {
          button.focus();
        }
      }, 0);
      setPopoverOpen(false);
    };

    return (
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild className="">
          <Button
            ref={buttonRef}
            variant="outline"
            role="combobox"
            aria-expanded={popoverOpen}
            data-match-index={matchIndex}
            data-player-index={playerIndex}
            className="flex-1"
          >
            {memberValue}
            <ChevronsUpDown className="opacity-50 ml-auto" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="h-[300px]">
          <Command className="w-full">
            <CommandInput placeholder="Search member" />
            <CommandList>
              <CommandEmpty>No member found.</CommandEmpty>
              <CommandGroup>
                {sortedPlayers.map((player, idx) => (
                  <CommandItem key={idx} value={player} onSelect={handleSelect}>
                    {player}
                    <Check
                      className={cn(
                        'ml-auto',
                        memberValue === player ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };

  type MatchRowProps = {
    key: number;
    match: Match;
    matchIndex: number;
    rowspan: number;
    isFirstMatch: boolean;
    showScore: boolean;
  };

  const MatchRow = React.memo(
    ({
      match,
      matchIndex,
      rowspan,
      isFirstMatch,
      showScore,
    }: MatchRowProps) => {
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
              <div className="flex gap-x-2 p-2 border-b-[1px]">
                <PopoverCommand
                  matchIndex={matchIndex}
                  match={match}
                  playerIndex={0}
                />
                <PopoverCommand
                  matchIndex={matchIndex}
                  match={match}
                  playerIndex={1}
                />
              </div>
              <div className="flex gap-x-2 p-2">
                <PopoverCommand
                  matchIndex={matchIndex}
                  match={match}
                  playerIndex={2}
                />
                <PopoverCommand
                  matchIndex={matchIndex}
                  match={match}
                  playerIndex={3}
                />
              </div>
            </div>
          </td>
          {showScore && (
            <td className="p-0">
              <div className="flex flex-col">
                <div className="p-2 border-b-[1px]">
                  <Select
                    defaultValue={match.score[0] || '0'}
                    onValueChange={(value) =>
                      handleScoreChange(value, matchIndex, 0)
                    }
                  >
                    <SelectTrigger
                      className="text-xs"
                      value="0"
                      data-match-index={matchIndex}
                      data-score-index={0}
                    >
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
                <div className="p-2">
                  <Select
                    defaultValue={match.score[1] || '0'}
                    onValueChange={(value) =>
                      handleScoreChange(value, matchIndex, 1)
                    }
                  >
                    <SelectTrigger
                      className="text-xs"
                      data-match-index={matchIndex}
                      data-score-index={1}
                    >
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
              </div>
            </td>
          )}
          {isFirstMatch && (
            <td rowSpan={rowspan} className="text-xs">
              {match?.time && (idleSummary[match.time] || []).length > 0
                ? (idleSummary[match.time] || []).map((item, idx) => (
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
    <div className="pb-20">
      <div className="flex items-center gap-2 mb-4 justify-between">
        <label htmlFor="scoreCheck" className="font-bold">
          스코어 입력
        </label>
        <Switch
          id="scoreCheck"
          name="scoreCheck"
          checked={showScore}
          onCheckedChange={setShowScore}
        />
      </div>

      {/* 스케줄 상태 설정 */}
      <div className="mb-6">
        <Label className="text-base font-bold mb-3 block">스케줄 상태</Label>
        <RadioGroup
          value={scheduleStatus}
          onValueChange={(value) => {
            const newStatus = value as
              | 'pending'
              | 'attendees_done'
              | 'match_done'
              | 'game_done';
            console.log('🔄 스케줄 상태 변경:', {
              oldStatus: scheduleStatus,
              newStatus,
            });
            setScheduleStatus(newStatus);
          }}
          className="flex flex-wrap gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="pending" id="pending" />
            <Label htmlFor="pending" className="text-sm">
              대기중
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="attendees_done" id="attendees_done" />
            <Label htmlFor="attendees_done" className="text-sm">
              참석자 저장 완료
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="match_done" id="match_done" />
            <Label htmlFor="match_done" className="text-sm">
              대진표 작성 완료
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="game_done" id="game_done" />
            <Label htmlFor="game_done" className="text-sm">
              게임 결과 등록 완료
            </Label>
          </div>
        </RadioGroup>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>시간</th>
            <th>코트</th>
            <th>페어</th>
            {showScore && <th>스코어</th>}
            <th>대기자</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match, index) => {
            // 현재 시간의 첫 번째 경기인지 확인
            const isFirstMatch =
              index === 0 || matches[index - 1]?.time !== match.time;
            // 해당 시간대의 경기 수 계산
            const rowspan = matches.filter(
              (m) => m?.time === match.time
            ).length;
            return (
              <MatchRow
                key={index}
                match={match}
                matchIndex={index}
                rowspan={rowspan}
                isFirstMatch={isFirstMatch}
                showScore={showScore}
              />
            );
          })}
        </tbody>
      </table>

      <h2 className="text-lg font-bold my-4">Games Played</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Player</th>
            <th>Games Played</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(gamesPlayed)
            .sort(([playerA], [playerB]) => playerA.localeCompare(playerB))
            .map(([player, count], index) => (
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
          disabled={loading}
        >
          {loading ? '저장 중...' : '저장'}
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
      {isLoading ? (
        <LoadingGrid loading={isLoading} />
      ) : !schedule ? (
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
