'use client';

import FormCourtCount from '@/components/FormCourtCount';
import FormCourtNumber from '@/components/FormCourtNumber';
import FormDatePicker from '@/components/FormDatePicker';
import FormMembers from '@/components/FormMembers';
import FormSelectTime from '@/components/FormSelectTime';
import { Container } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import useSchedule from '@/hooks/useSchedule';
import {
  AttendanceProps,
  ScheduleFormSchema,
  ScheduleFormType,
} from '@/model/schedule';
import { AuthUser } from '@/model/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Grid } from 'react-loader-spinner';
import MyAttendance from './MyAttendance';

type Props = {
  scheduleId: string;
  user: AuthUser;
};

const defaultAttendance: AttendanceProps = {
  _key: '',
  name: '',
  gender: '',
  startHour: '19',
  startMinute: '00',
  endHour: '22',
  endMinute: '00',
};

export default function ScheduleDetailAdmin({ scheduleId, user }: Props) {
  const userName = user?.name;
  const gender = user?.gender;
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [myAttendance, setMyAttendance] =
    useState<AttendanceProps>(defaultAttendance);
  const { schedule, isLoading, patchSchedule, removeSchedule } =
    useSchedule(scheduleId);

  const form = useForm<ScheduleFormType>({
    resolver: zodResolver(ScheduleFormSchema),
  });

  useEffect(() => {
    if (schedule) {
      form.reset({
        ...schedule,
        date: schedule.date ? new Date(schedule.date) : new Date(),
      });

      const existingIndex = schedule.attendees.findIndex(
        (attendee: AttendanceProps) => attendee.name === userName
      );

      if (existingIndex !== -1) {
        setMyAttendance(schedule.attendees[existingIndex]);
      } else {
        setMyAttendance({
          name: userName,
          gender: gender,
          startHour: schedule.startTime,
          startMinute: '00',
          endHour: schedule.endTime,
          endMinute: '00',
        });
      }
    }
  }, [schedule, form, userName, gender]);

  useEffect(() => {
    if (Object.keys(form.formState.errors).length > 0) {
      console.error('⚠️ 실시간 검증 오류:', form.formState.errors);
    }
  }, [form.formState.errors]);

  const handleDelete = () => {
    const isConfirmed = confirm('정말 삭제하시겠습니까?');
    if (isConfirmed) {
      setLoading(true);
      removeSchedule()
        .then((data) => console.log(data))
        .catch((error) => console.error(error))
        .finally(() => {
          setLoading(false);
          router.push('/');
        });
    }
  };

  function onSubmit(data: ScheduleFormType) {
    setLoading(true);
    patchSchedule(data)
      .then((data) => {
        console.log(data);
      })
      .catch((error) => console.error(error))
      .finally(() => {
        toast({
          title: '업데이트 완료',
          duration: 1500,
        });
        setLoading(false);
      });
  }

  const handleCourtCountChange = (count: string) => {
    const countNumber = parseInt(count, 10);
    const currentCourtNumbers = form.getValues('courtNumbers') || [];

    if (countNumber > currentCourtNumbers.length) {
      // ✅ 값이 크면 새로운 항목 추가
      const newCourts = Array.from(
        { length: countNumber - currentCourtNumbers.length },
        (_, idx) => ({
          _key: crypto.randomUUID(),
          number: String(currentCourtNumbers.length + idx + 1),
        })
      );
      form.setValue('courtNumbers', [...currentCourtNumbers, ...newCourts]);
    } else if (countNumber < currentCourtNumbers.length) {
      // ✅ 값이 작으면 배열 크기 줄이기 (slice 사용)
      form.setValue('courtNumbers', currentCourtNumbers.slice(0, countNumber));
    }
  };

  return (
    <Container>
      {(loading || isLoading) && (
        <Grid
          visible={true}
          height="80"
          width="80"
          color="#b91c1c"
          ariaLabel="grid-loading"
          radius="12.5"
          wrapperClass="grid-wrapper"
        />
      )}
      {schedule && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pb-[80px]"
          >
            <div className="flex items-align justify-between">
              <Label htmlFor="votinCheck">참석투표시작</Label>
              <Switch
                id="votinCheck"
                name="votinCheck"
                checked={form.watch('voting')}
                onCheckedChange={(value) => form.setValue('voting', value)}
              />
            </div>
            {myAttendance && (
              <MyAttendance
                myAttendance={myAttendance}
                onAttendanceChange={setMyAttendance}
                scheduleId={scheduleId}
                startTime={Number(schedule.startTime)}
                endTime={Number(schedule.endTime)}
              />
            )}

            <FormDatePicker form={form} />
            <div className="grid grid-cols-2 gap-4">
              <FormSelectTime
                name="startTime"
                form={form}
                label="시작 시간"
                value={schedule?.startTime}
              />
              <FormSelectTime
                name="endTime"
                form={form}
                label="종료 시간"
                startTime={parseInt(schedule?.startTime, 10)}
                value={schedule?.endTime}
              />
            </div>

            <div>
              <Label>코트이름</Label>
              <Input type="text" {...form.register('courtName')} />
            </div>

            <div>
              <FormCourtCount
                form={form}
                value={schedule.courtCount}
                onHandleChange={handleCourtCountChange}
              />
              {/* <Input
                type="text"
                value={form.watch('courtCount') || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  form.setValue('courtCount', value);
                  handleCourtCountChange(value);
                }}
              /> */}
            </div>

            <div className="flex gap-3">
              {Array.from(
                { length: parseInt(form.watch('courtCount'), 10) },
                (_, idx) => (
                  <FormCourtNumber key={idx} form={form} idx={idx} />
                )
              )}
            </div>

            <FormMembers
              form={form}
              attendees={form.watch('attendees')}
              startTime={Number(schedule.startTime)}
              endTime={Number(schedule.endTime)}
            />

            <div className="button-group">
              <Button
                type="button"
                variant="destructive"
                onClick={() => handleDelete()}
              >
                삭제
              </Button>
              <Button type="submit">수정</Button>
              <Button
                type="button"
                onClick={() => {
                  router.push(`/games/${scheduleId}`);
                }}
              >
                대진표작성
              </Button>
            </div>
          </form>
        </Form>
      )}
    </Container>
  );
}
