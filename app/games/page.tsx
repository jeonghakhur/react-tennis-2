'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronsUpDown } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

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
}

interface Props {
  attendees: Attendee[];
  startTime: string; // Format: "HH:mm"
  endTime: string; // Format: "HH:mm"
  courts: number;
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

const TennisMatchScheduler: React.FC<Props> = ({ attendees, startTime, endTime, courts }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [idleSummary, setIdleSummary] = useState<Record<string, string[]>>({});
  const [gamesPlayed, setGamesPlayed] = useState<Record<string, number>>({});
  const [activePopoverId, setActivePopoverId] = useState<string | null>(null);
  const womenFirst = true;

  const generateSchedule = useCallback(() => {
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
          new Date(`2023-01-01T${attendee.startTime}:00`) <= new Date(`2023-01-01T${slot}:00`) &&
          new Date(`2023-01-01T${slot}:00`) < new Date(`2023-01-01T${attendee.endTime}:00`),
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
          });
          womenPlayers.forEach((p) => {
            availableWomen.splice(availableWomen.indexOf(p), 1);
            available.splice(available.indexOf(p), 1);
          });
        } else if (available.length >= 4) {
          // 일반 복식 게임 생성
          const players = available
            .sort((a, b) => gamesCount[a.name] - gamesCount[b.name])
            .slice(0, 4)
            .sort(() => Math.random() - 0.5);
          players.forEach((player) => {
            gamesCount[player.name] += 1;
            playing.push(player);
          });
          schedule.push({
            time: slot,
            court,
            players: players.map((p) => p.name),
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

  const handlePlayersChange = (player: string, matchIndex: number, playerIndex: number) => {
    const updateMatches = [...matches];
    const prevName = updateMatches[matchIndex].players[playerIndex];
    const prevIndex = updateMatches[matchIndex].players.findIndex((item) => item === player);

    // 교체 작업
    updateMatches[matchIndex].players[playerIndex] = player;
    if (prevIndex !== -1) {
      updateMatches[matchIndex].players[prevIndex] = prevName;
    }

    // 대기자 업데이트
    const matchTime = updateMatches[matchIndex].time;
    const updateIdleSummary = { ...idleSummary };

    const idleIndex = updateIdleSummary[matchTime]?.findIndex((item) => item === player);
    if (idleIndex !== -1) {
      updateIdleSummary[matchTime] = [
        ...updateIdleSummary[matchTime].slice(0, idleIndex),
        prevName,
        ...updateIdleSummary[matchTime].slice(idleIndex + 1),
      ];
    }

    setMatches(updateMatches);
    setIdleSummary(updateIdleSummary);
    setActivePopoverId(null);
  };

  const attendessAtTime = (time: string, name: string) => {
    const attendessPlayers = matches
      .filter((match) => match.time === time)
      .flatMap((match) => match.players)
      .filter((player) => player !== name);
    const idleplayers = idleSummary[time];
    return [...attendessPlayers, ...idleplayers];
  };

  type AttendeePopoverProp = {
    matchIndex: number;
    match: Match;
    playerIndex: number;
  };

  const AttendeePopover: React.FC<AttendeePopoverProp> = ({ matchIndex, match, playerIndex }) => {
    return (
      <Popover
        open={activePopoverId === `popover${matchIndex}${playerIndex}`}
        onOpenChange={(isOpen) => setActivePopoverId(isOpen ? `popover${matchIndex}${playerIndex}` : null)}
      >
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" className="my-1">
            {match.players[playerIndex]}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="h-[300px]">
          <Command>
            <CommandInput placeholder="Search member" />
            <CommandList>
              <CommandEmpty>No member found.</CommandEmpty>
              <CommandGroup>
                {attendessAtTime(match.time, match.players[playerIndex]).map((player, idx) => (
                  <CommandItem
                    key={idx}
                    value={player}
                    onSelect={(currentValue) => {
                      handlePlayersChange(currentValue, matchIndex, playerIndex);
                    }}
                  >
                    {player}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <div className="p-5">
      <h1>Tennis Match Scheduler</h1>

      <h2>Match Schedule</h2>
      <table className="table">
        <thead>
          <tr>
            <th>시간</th>
            <th>코트</th>
            <th style={{ width: '30%' }}>페어 A</th>
            <th style={{ width: '30%' }}>페어 B</th>
            <th>대기자</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match, index) => {
            // 현재 시간의 첫 번째 경기인지 확인
            const isFirstMatch = index === 0 || matches[index - 1].time !== match.time;

            // 해당 시간대의 경기 수 계산
            const rowspan = matches.filter((m) => m.time === match.time).length;
            return (
              <tr key={index}>
                {isFirstMatch && <td rowSpan={rowspan}>{match.time}</td>}
                <td>{match.court}</td>
                <td>
                  <AttendeePopover matchIndex={index} match={match} playerIndex={0} />
                  <AttendeePopover matchIndex={index} match={match} playerIndex={1} />
                </td>
                <td>
                  <Input
                    type="text"
                    value={match.players[2]}
                    onChange={(e) => handlePlayersChange(e.target.value, index, 2)}
                    className="w-full"
                  />
                  <Input
                    type="text"
                    value={match.players[3]}
                    onChange={(e) => handlePlayersChange(e.target.value, index, 3)}
                    className="w-full"
                  />
                </td>
                {isFirstMatch && (
                  <td rowSpan={rowspan} className="text-xs">
                    {idleSummary[match.time] && idleSummary[match.time].length > 0
                      ? idleSummary[match.time].map((item, idx) => <div key={idx}>{item}</div>)
                      : '없음'}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* 
      <h2>Idle Players</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Idle Players</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(idleSummary).map(([time, idle], index) => (
            <tr key={index}>
              <td>{time}</td>
              <td>{idle.join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table> */}

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
    </div>
  );
};

export default function Home() {
  const [schedulerData, setSchedulerData] = useState(data);
  const handleRegenerate = () => {
    const shuffledAttendees = [...schedulerData.attendees].sort(() => Math.random() - 0.5);
    // console.log(schedulerData);
    setSchedulerData((prev) => ({
      ...prev,
      attendees: shuffledAttendees,
    }));
  };

  return (
    <div>
      <Button onClick={handleRegenerate}>Regenerate Matches</Button>
      {/* <Button onClick={handleRegenerate}>availableWomen</Button> */}
      <TennisMatchScheduler
        attendees={schedulerData.attendees}
        startTime={schedulerData.startTime}
        endTime={schedulerData.endTime}
        courts={parseInt(schedulerData.courtCount, 10)}
      />
    </div>
  );
}

