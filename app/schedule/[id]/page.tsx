/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { use, useEffect, useState } from 'react';
import { useCacheKeys } from '@/context/CacheKeysContext';
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
import FormAttendees from '@/components/FormAttendees';
import useSchedule from '@/hooks/schedule';
import { useRouter } from 'next/navigation';

type Props = {
  params: Promise<{ id: string }>; // params가 Promise로 감싸져 있음
};

type AttendanceTimeProps = Omit<
  AttendanceProps,
  'name' | 'gender' | 'membership'
>;

const defaultGameTime: AttendanceTimeProps = {
  startHour: '19',
  startMinute: '00',
  endHour: '22',
  endMinute: '00',
};

export default function Page({ params }: Props) {
  const { session } = useAuthRedirect();
  const userName = session?.user?.name;
  const { id } = use(params); // params를 비동기로 처리
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  // const [myAttendance, setMyAttendance] = useState<AttendanceProps>();
  const [attendanceTime, setAttendanceTime] =
    useState<AttendanceTimeProps>(defaultGameTime);
  const { schedule, isLoading, postAttendance, patchSchedule, removeSchedule } =
    useSchedule(id);

  const [attendees, setAttendees] = useState<AttendanceProps[]>([]);

  const form = useForm<ScheduleFormType>({
    resolver: zodResolver(ScheduleFormSchema),
  });

  useEffect(() => {
    if (schedule) {
      form.reset({
        ...schedule,
        date: schedule.date ? new Date(schedule.date) : new Date(),
      });

      // const existingIndex = attendees.findIndex(
      //   (attendee: AttendanceProps) => attendee.name === userName
      // );

      // if (existingIndex !== -1) {
      //   const myAttendance = data.attendees[existingIndex];
      //   setAttendanceTime({
      //     startHour: myAttendance.startHour,
      //     startMinute: myAttendance.startMinute,
      //     endHour: myAttendance.endHour,
      //     endMinute: myAttendance.endMinute,
      //   });
      // } else {
      //   setAttendanceTime({
      //     startHour: data.startTime,
      //     startMinute: '00',
      //     endHour: data.endTime,
      //     endMinute: '00',
      //   });
      // }

      setAttendees(schedule.attendees);
    }
  }, [schedule, form, userName]);

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
      // fetch(`/api/schedule/${id}`, {
      //   method: 'DELETE',
      // })
      //   .then((response) => response.json())
      //   .then((data) => {
      //     console.log('삭제 완료:', data);
      //     mutate(
      //       cacheKeys.scheduleKey,
      //       (currentData: any) => {
      //         return currentData?.filter((item: any) => item.id !== id);
      //       },
      //       false
      //     );
      //   })
      //   .catch((error) => console.error('삭제 중 오류 발생:', error))
      //   .finally(() => {

      //   });
    }
  };

  const handleUpdate = async (formData: ScheduleFormType) => {
    // setLoading(true);
    // try {
    //   const response = await fetch(`/api/schedule/${id}`, {
    //     method: 'PATCH',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(formData),
    //   });
    //   const result = await response.json();
    //   if (!response.ok) {
    //     throw new Error(result.error || '업데이트 실패');
    //   }
    //   console.log('✅ 업데이트 성공:', result);
    //   // ✅ API 요청 없이 로컬 데이터를 업데이트
    //   mutate(`/api/schedule/${id}`);
    //   alert(result.message);
    // } catch (error) {
    //   if (error instanceof Error) {
    //     console.error('❌ 업데이트 실패:', error);
    //     alert(`업데이트 중 오류 발생: ${error.message}`);
    //   }
    // } finally {
    //   setLoading(false);
    // }
  };

  function onSubmit(formData: ScheduleFormType) {
    setLoading(true);
    patchSchedule(formData)
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
    const { startHour, startMinute, endHour, endMinute } = attendanceTime;
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
    // ✅ 1. 시작시간과 종료시간이 같은지 확인
    const isSameTime = startTime.getTime() === endTime.getTime();
    // ✅ 2. 시작시간이 종료시간보다 큰지 확인 (잘못된 경우)
    const isStartTimeAfterEndTime = startTime.getTime() > endTime.getTime();
    // ✅ 3. 시작시간과 종료시간의 차이 (밀리초 → 분 변환)
    const timeDifferenceMs = endTime.getTime() - startTime.getTime();
    const timeDifferenceMinutes = timeDifferenceMs / (1000 * 60); // 밀리초 → 분 변환
    if (isSameTime) {
      alert('시작시간과 종료시간이 동일합니다.');
      return;
    }
    if (isStartTimeAfterEndTime) {
      alert('시작시간이 종료시간보다 늦습니다.');
      return;
    }
    if (timeDifferenceMinutes <= 30) {
      alert('운동시간이 너무 짧습니다. 확인해주세요.');
      return;
    }

    const newAttendees = {
      name: session?.user?.name || '',
      gender: '남성',
      startHour,
      startMinute,
      endHour,
      endMinute,
      membership: true,
    };

    postAttendance(newAttendees);
  };

  async function handleAttendeeRemove(attendeeKey: string) {
    // await fetch(`/api/attendance`, {
    //   method: 'DELETE',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ scheduleId: id, attendeeKey }),
    // });
    // mutate(`/api/schedule/`, async () => {
    //   const response = await fetch(`/api/schedule/${id}`);
    //   return response.json();
    // });
  }

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
                  value={attendanceTime.startHour}
                  onValueChange={(value) => {
                    if (!value) return;
                    setAttendanceTime((pre) => ({ ...pre, startHour: value }));
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
                  value={attendanceTime.startMinute}
                  onValueChange={(value) => {
                    if (!value) return;
                    setAttendanceTime((pre) => ({
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
                  value={attendanceTime.endHour}
                  onValueChange={(value) => {
                    if (!value) return;
                    setAttendanceTime((pre) => ({ ...pre, endHour: value }));
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
                  value={attendanceTime.endMinute}
                  onValueChange={(value) => {
                    if (!value) return;
                    setAttendanceTime((pre) => ({ ...pre, endMinute: value }));
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

            {/* <FormCourtName form={form} value={data.courtName} /> */}
            <Input type="text" {...form.register('courtName')} />
            <Input type="text" {...form.register('courtCount')} />
            {form.watch('courtNumbers')?.map((_, idx) => {
              return (
                <Input
                  key={idx}
                  type="text"
                  {...form.register(`courtNumbers.${idx}.number`)}
                />
              );
            })}
            <FormAttendees
              attendees={attendees}
              onRemoveAttendee={handleAttendeeRemove}
            />

            <div className="button-group">
              <Button
                type="button"
                variant="destructive"
                onClick={() => handleDelete(id)}
              >
                삭제
              </Button>
              <Button
                type="submit"
                // onClick={() => {
                //   console.log(form);
                // }}
              >
                수정
              </Button>
            </div>
          </form>
        </Form>
      )}
    </Container>
  );
}
