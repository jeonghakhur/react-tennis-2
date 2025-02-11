/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { use, useEffect, useState } from 'react';
import { Container } from '@/components/Layout';
import {
  AttendanceProps,
  ScheduleFormSchema,
  ScheduleFormType,
} from '@/model/schedule';
import { Button } from '@/components/ui/button';
import { Grid } from 'react-loader-spinner';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import FormDatePicker from '@/components/FormDatePicker';
import FormSelectTime from '@/components/FormSelectTime';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import useAuthRedirect from '@/hooks/useAuthRedirect';
import { toast } from '@/hooks/use-toast';
import useSchedule from '@/hooks/useSchedule';
import { useRouter } from 'next/navigation';
import FormMembers from '@/components/FormMembers';

type Props = {
  params: Promise<{ id: string }>; // params가 Promise로 감싸져 있음
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

export default function Page({ params }: Props) {
  const { session } = useAuthRedirect();
  const userName = session?.user?.name;
  const gender = session?.user?.gender;
  const { id } = use(params); // params를 비동기로 처리
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [myAttendance, setMyAttendance] =
    useState<AttendanceProps>(defaultAttendance);
  const {
    schedule,
    isLoading,
    postAttendance,
    patchAttendance,
    patchSchedule,
    removeSchedule,
  } = useSchedule(id);

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
          name: userName!,
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
        setLoading(false);
        toast({
          title: '참석시간이 등록되었습니다.',
          duration: 1500,
        });
      });
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
            <div>
              <Label className="w-full">참석 시간</Label>
              <div className="flex gap-x-2 items-center">
                <Select
                  value={myAttendance.startHour}
                  onValueChange={(value) => {
                    if (!value) return;
                    setMyAttendance((pre) => ({ ...pre, startHour: value }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(
                      {
                        length:
                          parseInt(schedule.endTime, 10) -
                          parseInt(schedule.startTime, 10),
                      },
                      (_, idx) => (
                        <SelectItem
                          value={String(parseInt(schedule.startTime, 10) + idx)}
                          key={idx}
                        >
                          {String(parseInt(schedule.startTime, 10) + idx)}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>

                <Select
                  value={myAttendance.startMinute}
                  onValueChange={(value) => {
                    if (!value) return;
                    setMyAttendance((pre) => ({
                      ...pre,
                      startMinute: value,
                    }));
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
                    setMyAttendance((pre) => ({ ...pre, endHour: value }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(
                      {
                        length:
                          parseInt(schedule.endTime, 10) -
                          parseInt(schedule.startTime, 10),
                      },
                      (_, idx) => (
                        <SelectItem
                          value={String(
                            parseInt(schedule.startTime, 10) + idx + 1
                          )}
                          key={idx}
                        >
                          {String(parseInt(schedule.startTime, 10) + idx + 1)}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <Select
                  value={myAttendance.endMinute}
                  onValueChange={(value) => {
                    if (!value) return;
                    setMyAttendance((pre) => ({ ...pre, endMinute: value }));
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
              <Button
                type="button"
                variant="secondary"
                className="w-full mt-2"
                onClick={handleAttendance}
              >
                참석시간 등록
              </Button>
            </div>
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
              <Label>코트 수</Label>
              <Input type="text" {...form.register('courtCount')} />
            </div>

            {form.watch('courtNumbers')?.map((_, idx) => {
              return (
                <div key={idx}>
                  <Input
                    type="text"
                    {...form.register(`courtNumbers.${idx}.number`)}
                  />
                </div>
              );
            })}

            <FormMembers form={form} attendees={form.watch('attendees')} />

            <div className="button-group">
              <Button
                type="button"
                variant="destructive"
                onClick={() => handleDelete()}
              >
                삭제
              </Button>
              <Button type="submit">수정</Button>
            </div>
          </form>
        </Form>
      )}
    </Container>
  );
}
