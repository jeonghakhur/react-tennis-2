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
import { useRef, useLayoutEffect } from 'react';

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

const getChosung = (text: string) => {
  const CHO = [
    'ㄱ',
    'ㄲ',
    'ㄴ',
    'ㄷ',
    'ㄸ',
    'ㄹ',
    'ㅁ',
    'ㅂ',
    'ㅃ',
    'ㅅ',
    'ㅆ',
    'ㅇ',
    'ㅈ',
    'ㅉ',
    'ㅊ',
    'ㅋ',
    'ㅌ',
    'ㅍ',
    'ㅎ',
  ];
  return Array.from(text)
    .map((char) => {
      const code = char.charCodeAt(0) - 44032;
      if (code >= 0 && code <= 11171) {
        return CHO[Math.floor(code / 588)];
      } else {
        return char;
      }
    })
    .join('');
};

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

  useEffect(() => {
    generateSchedule();
  }, [generateSchedule]);

  const handlePlayersChange = useCallback(
    (player: string, matchIndex: number, playerIndex: number) => {
      const updateMatches = [...matches];
      const match = updateMatches[matchIndex];
      if (!match) return;

      const prevName = match.players[playerIndex];
      const prevIndex = match.players.findIndex((item) => item === player);

      // 교체 작업
      if (prevIndex !== -1) {
        // 이미 선택된 선수와 교체
        match.players[playerIndex] = player;
        if (prevName) {
          match.players[prevIndex] = prevName;
        }
      } else {
        // 새로운 선수 선택
        match.players[playerIndex] = player;
      }

      // 대기자 업데이트
      const matchTime = match.time;
      const updateIdleSummary = { ...idleSummary };

      const idleIndex = updateIdleSummary[matchTime]?.findIndex(
        (item) => item === player
      );

      if (idleIndex !== -1 && typeof idleIndex === 'number') {
        const updateGamesCount = { ...gamesPlayed };
        updateGamesCount[player] = (updateGamesCount[player] || 0) + 1;

        if (prevName) {
          if (!updateIdleSummary[matchTime]) {
            updateIdleSummary[matchTime] = [];
          }
          updateIdleSummary[matchTime] = [
            ...updateIdleSummary[matchTime].slice(0, idleIndex),
            prevName,
            ...updateIdleSummary[matchTime].slice(idleIndex + 1),
          ];
          updateGamesCount[prevName] = (updateGamesCount[prevName] || 0) - 1;
        } else if (updateIdleSummary[matchTime]) {
          updateIdleSummary[matchTime].splice(idleIndex, 1);
        }

        setGamesPlayed(updateGamesCount);
      }

      setMatches(updateMatches);
      setIdleSummary(updateIdleSummary);

      // 상태 변경 후 즉시 포커스 설정
      requestAnimationFrame(() => {
        const input = document.querySelector(
          `input[data-match-index="${matchIndex}"][data-player-index="${playerIndex}"]`
        ) as HTMLInputElement;
        if (input) {
          input.focus();
        }
      });
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

    try {
      const response = await fetch(`/api/match/${scheduleId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduleId, matches }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);

      // SWR 캐시 무효화 후 페이지 이동
      await mutate('/api/games', undefined, { revalidate: true });

      // 잠시 대기하여 데이터 로드 완료 보장
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 성공 시 페이지 이동
      router.push('/games');
    } catch (error) {
      console.error('대진표 저장 중 오류:', error);

      // 에러 발생 시 사용자에게 알림
      alert('대진표 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const attendessAtTime = (time: string, name: string) => {
    const attendessPlayers = matches
      .filter((match) => match.time === time)
      .flatMap((match) => match.players)
      .filter((player) => player !== name && player !== '');
    const idleplayers = idleSummary[time] || [];
    return [...attendessPlayers, ...idleplayers];
  };

  type PlayerAutocompleteProp = {
    matchIndex: number;
    match: Match;
    playerIndex: number;
  };

  const PlayerAutocomplete: React.FC<PlayerAutocompleteProp> = ({
    matchIndex,
    match,
    playerIndex,
  }) => {
    const [inputValue, setInputValue] = useState(match.players[playerIndex]);
    const [filteredPlayers, setFilteredPlayers] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [shouldFocus, setShouldFocus] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    useLayoutEffect(() => {
      if (shouldFocus && inputRef.current) {
        inputRef.current.focus();
        setShouldFocus(false);
      }
    }, [shouldFocus]);

    const validatePlayer = (value: string | undefined) => {
      const players = match?.time
        ? match?.players?.[playerIndex]
          ? attendessAtTime(match.time, match.players[playerIndex])
          : idleSummary[match.time] || []
        : [];

      // 현재 설정된 선수 이름이 있으면 유효한 것으로 처리
      if (match.players[playerIndex] === value) {
        return true;
      }

      if (!players.includes(value ?? '')) {
        alert('등록되지 않은 선수입니다');
        setInputValue(match.players[playerIndex] ?? ''); // 기존 값으로 복원
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
        return false;
      }
      return true;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.trim();
      setInputValue(value);

      if (!value) {
        setFilteredPlayers([]);
        setShowSuggestions(false);
        return;
      }

      const players = match?.time
        ? match?.players?.[playerIndex]
          ? attendessAtTime(match.time, match.players[playerIndex])
          : idleSummary[match.time] || []
        : [];

      const matched = players.filter(
        (name) => name.includes(value) || getChosung(name).includes(value)
      );
      setFilteredPlayers(matched);
      setShowSuggestions(true);
    };

    const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (validatePlayer(inputValue)) {
          handlePlayersChange(inputValue ?? '', matchIndex, playerIndex);
          setShouldFocus(true);
        }
      } else if (
        e.key === 'Tab' &&
        showSuggestions &&
        filteredPlayers.length > 0
      ) {
        e.preventDefault();
        const firstItem = listRef.current?.querySelector('li');
        if (firstItem instanceof HTMLElement) {
          firstItem.focus();
        }
      }
    };

    const handleListKeyDown = (
      e: React.KeyboardEvent<HTMLLIElement>,
      index: number
    ) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = (index + 1) % filteredPlayers.length;
        const nextItem = listRef.current?.querySelectorAll('li')[nextIndex];
        if (nextItem instanceof HTMLElement) {
          nextItem.focus();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex =
          (index - 1 + filteredPlayers.length) % filteredPlayers.length;
        const prevItem = listRef.current?.querySelectorAll('li')[prevIndex];
        if (prevItem instanceof HTMLElement) {
          prevItem.focus();
        }
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
        inputRef.current?.focus();
      }
    };

    const handleSelect = (name: string) => {
      setInputValue(name);
      setShowSuggestions(false);
      handlePlayersChange(name, matchIndex, playerIndex);
      // 선택 후 포커스 유지
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    };

    return (
      <div style={{ position: 'relative', width: '80px' }}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleChange}
          onKeyUp={handleKeyUp}
          placeholder="선수 이름 또는 초성 입력"
          style={{ width: '100%', padding: '8px' }}
          className="border rounded-md text-center"
          data-match-index={matchIndex}
          data-player-index={playerIndex}
        />
        {showSuggestions && filteredPlayers.length > 0 && (
          <ul
            ref={listRef}
            className="absolute w-full bg-white border border-gray-200 rounded-md shadow-sm z-50 max-h-[150px] overflow-y-auto"
          >
            {filteredPlayers.map((name, index) => (
              <li
                key={name}
                onClick={() => handleSelect(name)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSelect(name);
                  } else {
                    handleListKeyDown(e, index);
                  }
                }}
                tabIndex={0}
                className="px-2 py-1.5 cursor-pointer outline-none transition-colors duration-200 hover:bg-gray-50 focus:bg-gray-100 first:rounded-t-md last:rounded-b-md"
                onMouseDown={(e) => e.preventDefault()}
              >
                {name}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  type MatchRowProps = {
    key: number;
    match: Match;
    matchIndex: number;
    rowspan: number;
    isFirstMatch: boolean;
  };

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
                <PlayerAutocomplete
                  matchIndex={matchIndex}
                  match={match}
                  playerIndex={0}
                />
                <PlayerAutocomplete
                  matchIndex={matchIndex}
                  match={match}
                  playerIndex={1}
                />
              </div>
              <div className="flex gap-x-1 justify-center">
                <PlayerAutocomplete
                  matchIndex={matchIndex}
                  match={match}
                  playerIndex={2}
                />
                <PlayerAutocomplete
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
                defaultValue={match.score[0] || '0'}
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
                defaultValue={match.score[1] || '0'}
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
            .sort(([playerA, countA], [playerB, countB]) => {
              if (countA !== countB) {
                return countA - countB;
              }
              return playerA.localeCompare(playerB);
            })
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
