import useSchedule from '@/hooks/useSchedule';
import { AuthUser } from '@/model/user';
import LoadingGrid from '../LoadingGrid';
import { Container } from '../Layout';
import { format } from 'date-fns';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AttendanceProps } from '@/model/schedule';
import { useCallback, useEffect, useState } from 'react';
import MyAttendance from './MyAttendance';
import TextSplitter from '../TextSplitter';
import { ko } from 'date-fns/locale';

const defaultAttendance: AttendanceProps = {
  _key: '',
  name: '',
  gender: '',
  startHour: '19',
  startMinute: '00',
  endHour: '22',
  endMinute: '00',
};

type Props = {
  scheduleId: string;
  user: AuthUser;
};

export default function ScheduleDetailUser({ scheduleId, user }: Props) {
  const userName = user.name;
  const gender = user.gender;
  const [attendanceStatus, setAttendanceStatus] = useState<string>('attend');
  const [myAttendance, setMyAttendance] =
    useState<AttendanceProps>(defaultAttendance);
  const { schedule, isLoading, removeAttendance } = useSchedule(scheduleId);

  useEffect(() => {
    if (schedule) {
      const existingIndex = schedule.attendees.findIndex(
        (attendee: AttendanceProps) => attendee.name === userName
      );
      if (existingIndex !== -1 && schedule.attendees[existingIndex]) {
        setMyAttendance(schedule.attendees[existingIndex]);
      } else {
        setMyAttendance({
          _key: '',
          name: userName,
          gender: gender,
          startHour: schedule.startTime,
          startMinute: '00',
          endHour: schedule.endTime,
          endMinute: '00',
        });
      }
    }
  }, [schedule, userName, gender]);

  const handleAttendanceStatus = useCallback(
    (value: string) => {
      if (value === 'absence' && myAttendance._key) {
        const isConfirmed = confirm(
          '불참 선택시 기존 입력한 참석 시간이 삭제됩니다.'
        );
        if (!isConfirmed) {
          return;
        }

        removeAttendance(myAttendance._key);
      }
      setAttendanceStatus(value);
    },
    [myAttendance, removeAttendance]
  );

  if (isLoading) {
    return <LoadingGrid loading={isLoading} />;
  }

  if (!schedule) {
    return <p>데이터를 불러 올 수 없습니다.</p>;
  }

  const {
    date,
    courtName,
    courtCount,
    courtNumbers,
    startTime,
    endTime,
    attendees,
  } = schedule;

  return (
    <Container className="space-y-4">
      <div className="flex items-align justify-between border px-5 py-4 rounded-[16px]">
        <strong>참석여부</strong>
        <RadioGroup
          value={attendanceStatus}
          className="flex"
          onValueChange={handleAttendanceStatus}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="attend" id="attend" />
            <Label htmlFor="attend">참석</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="absence" id="absence" />
            <Label htmlFor="absence">불참</Label>
          </div>
        </RadioGroup>
      </div>
      {attendanceStatus === 'attend' && (
        <MyAttendance
          scheduleId={scheduleId}
          myAttendance={myAttendance}
          onAttendanceChange={setMyAttendance}
          startTime={Number(startTime)}
          endTime={Number(endTime)}
        />
      )}

      <ul className="border px-5 py-4 rounded-[16px] space-y-1">
        <li className="flex">
          <TextSplitter text="날짜" width={70} />
          <span className="mx-2">:</span>
          <span>{format(new Date(date), 'yyyy.MM.dd')}</span>
          <span className="ml-2">
            {format(new Date(date), 'EEEE', { locale: ko })}
          </span>
          <span className="ml-2">
            {startTime}시 - {endTime}시
          </span>
        </li>
        <li className="flex">
          <TextSplitter text="운동시간" width={70} />
          <span className="mx-2">:</span>
          <span>
            {startTime}시 - {endTime}시
          </span>
        </li>
        <li className="flex">
          <TextSplitter text="장소" width={70} />
          <span className="mx-2">:</span>
          {courtName}
        </li>
        <li className="flex">
          <TextSplitter text="코트수" width={70} />
          <span className="mx-2">:</span>
          {courtCount}
        </li>
        <li className="flex">
          <TextSplitter text="코트번호" width={70} />
          <span className="mx-2">:</span>
          {courtNumbers?.join(', ') || '0'} 코트
        </li>
        <li className="flex">
          <TextSplitter text="참석인원" width={70} />
          <span className="mx-2">:</span>
          {attendees.length}
        </li>
      </ul>
      {attendees.length > 0 && (
        <>
          <div>참석자 목록</div>
          <table className="table w-full text-center text-xs">
            <thead>
              <tr>
                <th>번호</th>
                <th>참석자명</th>
                <th>성별</th>
                <th>참석시간</th>
              </tr>
            </thead>
            <tbody>
              {attendees.map((field, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{field.name}</td>
                  <td>{field.gender}</td>
                  <td>
                    {field.startHour}:{field.startMinute}~{field.endHour}:
                    {field.endMinute}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </Container>
  );
}
