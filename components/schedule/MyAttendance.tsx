import { AttendanceProps } from '@/model/schedule';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Button } from '../ui/button';
import useSchedule from '@/hooks/useSchedule';
import { useState } from 'react';
import LoadingGrid from '../LoadingGrid';
import { toast } from '@/hooks/use-toast';

type Props = {
  myAttendance: AttendanceProps;
  onAttendanceChange: (updatedAttendance: AttendanceProps) => void;
  scheduleId: string;
  startTime: number;
  endTime: number;
};

export default function MyAttendance({
  scheduleId,
  myAttendance,
  onAttendanceChange,
  startTime,
  endTime,
}: Props) {
  const [loading, setLoading] = useState<boolean>(false);
  const { postAttendance, patchAttendance } = useSchedule(scheduleId);

  const handleAttendance = async () => {
    const { startHour, startMinute, endHour, endMinute } = myAttendance;
    // ✅ 현재 날짜를 기준으로 시작시간과 종료시간을 `Date` 객체로 변환
    const now = new Date(); // 오늘 날짜 사용
    const startTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      parseInt(startHour, 10),
      parseInt(startMinute, 10)
    );
    const endTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      parseInt(endHour, 10),
      parseInt(endMinute, 10)
    );

    if (startTime.getTime() === endTime.getTime()) {
      alert('시작시간과 종료시간이 동일합니다.');
      return;
    }
    if (startTime.getTime() > endTime.getTime()) {
      alert('시작시간이 종료시간보다 늦습니다.');
      return;
    }
    if ((endTime.getTime() - startTime.getTime()) / (1000 * 60) <= 30) {
      alert('운동시간이 너무 짧습니다. 확인해주세요.');
      return;
    }

    const request = myAttendance._key ? patchAttendance : postAttendance;

    setLoading(true);
    request(myAttendance)
      .then((data) => console.log(data))
      .catch((error) => console.error(error))
      .finally(() => {
        toast({
          title: '참석시간이 등록되었습니다.',
          duration: 1500,
          onClose: () => {
            setLoading(false);
          },
        });
      });
  };

  if (!myAttendance) {
    return <p>데이터가 없습니다.</p>;
  }

  return (
    <div>
      {loading && <LoadingGrid loading={loading} />}
      <Label className="w-full">참석 시간</Label>
      <div className="flex gap-x-2 items-center">
        <Select
          value={myAttendance.startHour}
          onValueChange={(value) => {
            if (!value) return;
            onAttendanceChange({ ...myAttendance, startHour: value });
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from(
              {
                length: endTime - startTime,
              },
              (_, idx) => (
                <SelectItem value={String(startTime + idx)} key={idx}>
                  {String(startTime + idx)}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>

        <Select
          value={myAttendance.startMinute}
          onValueChange={(value) => {
            if (!value) return;
            onAttendanceChange({ ...myAttendance, startMinute: value });
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="00">00</SelectItem>
            <SelectItem value="30">30</SelectItem>
          </SelectContent>
        </Select>
        <span>~</span>
        <Select
          value={myAttendance.endHour}
          onValueChange={(value) => {
            if (!value) return;
            onAttendanceChange({ ...myAttendance, endHour: value });
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: endTime - startTime }, (_, idx) => (
              <SelectItem value={String(startTime + idx + 1)} key={idx}>
                {String(startTime + idx + 1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={myAttendance.endMinute}
          onValueChange={(value) => {
            if (!value) return;
            onAttendanceChange({ ...myAttendance, endMinute: value });
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="00">00</SelectItem>
            <SelectItem value="30">30</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="button" className="w-full mt-2" onClick={handleAttendance}>
        참석시간 등록
      </Button>
    </div>
  );
}
