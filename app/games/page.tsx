'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
  courtNumbers: ['1', '2', '3'],
  attendees: [
    { name: '김성재', gender: '남성', startTime: '19:30', endTime: '21:00' },
    { name: '김은아', gender: '여성', startTime: '19:30', endTime: '22:00' },
    { name: '김진환', gender: '남성', startTime: '19:30', endTime: '21:30' },
    { name: '나리메', gender: '여성', startTime: '19:30', endTime: '22:00' },
    { name: '목진성', gender: '남성', startTime: '19:30', endTime: '22:00' },
    { name: '박정선', gender: '여성', startTime: '19:30', endTime: '22:00' },
    { name: '박현천', gender: '남성', startTime: '19:00', endTime: '22:00' },
    { name: '손상미', gender: '여성', startTime: '19:00', endTime: '22:00' },
    { name: '송호석', gender: '남성', startTime: '19:00', endTime: '22:00' },
    { name: '양진용', gender: '남성', startTime: '19:00', endTime: '22:00' },
    { name: '윤슬', gender: '여성', startTime: '19:00', endTime: '22:00' },
    { name: '이금순', gender: '여성', startTime: '19:00', endTime: '22:00' },
    { name: '이덕희', gender: '남성', startTime: '19:00', endTime: '22:00' },
    { name: '이명진', gender: '남성', startTime: '19:00', endTime: '22:00' },
    { name: '이범영', gender: '남성', startTime: '19:00', endTime: '22:00' },
    { name: '이원태', gender: '남성', startTime: '19:00', endTime: '22:00' },
  ],
};

const TennisMatchScheduler: React.FC<Props> = ({ attendees, startTime, endTime, courts }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [idleSummary, setIdleSummary] = useState<Record<string, string[]>>({});
  const [gamesPlayed, setGamesPlayed] = useState<Record<string, number>>({});
  const womenFirst = false;

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
          const womenPlayers = availableWomen.slice(0, 4);
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

  const atGames = (time: string) => {
    return matches.filter((match) => match.time === time).length;
  };

  const atIdlePlayers = (time: string) => {
    // return idleSummary.filter((idle: any) => idle.time === time);
    return time;
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
                  <Input type="text" value={match.players[0]} className="w-full " />
                  <Input type="text" value={match.players[1]} className="w-full" />
                </td>
                <td>
                  <Input type="text" value={match.players[2]} className="w-full" />
                  <Input type="text" value={match.players[3]} className="w-full" />
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

