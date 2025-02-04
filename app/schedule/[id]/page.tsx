/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { use, useEffect, useRef, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { useCacheKeys } from '@/context/CacheKeysContext';
import { Container } from '@/components/Layout';
import { ScheduleFormSchema, ScheduleFormType } from '@/model/schedule';
import { Button } from '@/components/ui/button';
import { Grid } from 'react-loader-spinner';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import FormDatePicker from '@/components/FormDatePicker';
import FormSelectTime from '@/components/FormSelectTime';
import FormCourtName from '@/components/FormCourtName';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

type Props = {
  params: Promise<{ id: string }>; // params가 Promise로 감싸져 있음
};
export default function Page({ params }: Props) {
  const { id } = use(params); // params를 비동기로 처리
  const router = useRouter();
  const cacheKeys = useCacheKeys();
  const [loading, setLoading] = useState<boolean>(false);

  const { data, isLoading } = useSWR<ScheduleFormType>(`/api/schedule/${id}`);

  const form = useForm<ScheduleFormType>({
    resolver: zodResolver(ScheduleFormSchema),
  });

  useEffect(() => {
    if (data) {
      form.reset({
        ...data,
        date: data.date ? new Date(data.date) : new Date(),
      });
    }
    console.log('attendees', data?.attendees);
  }, [data, form]);

  useEffect(() => {
    if (Object.keys(form.formState.errors).length > 0) {
      console.error('⚠️ 실시간 검증 오류:', form.formState.errors);
    }
  }, [form.formState.errors]);

  const handleDelete = (id: string) => {
    const isConfirmed = confirm('정말 삭제하시겠습니까?');

    if (isConfirmed) {
      setLoading(true);
      fetch(`/api/schedule/${id}`, {
        method: 'DELETE',
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('삭제 완료:', data);
          mutate(
            cacheKeys.scheduleKey,
            (currentData: any) => {
              return currentData?.filter((item: any) => item.id !== id);
            },
            false
          );
        })
        .catch((error) => console.error('삭제 중 오류 발생:', error))
        .finally(() => {
          setLoading(false);
          router.push('/');
        });
    }
  };

  const handleUpdate = async (formData: ScheduleFormType) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/schedule/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || '업데이트 실패');
      }

      console.log('✅ 업데이트 성공:', result);

      // ✅ API 요청 없이 로컬 데이터를 업데이트
      mutate(`/api/schedule/${id}`);

      alert(result.message);
    } catch (error) {
      if (error instanceof Error) {
        console.error('❌ 업데이트 실패:', error);
        alert(`업데이트 중 오류 발생: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  function onSubmit(formData: ScheduleFormType) {
    handleUpdate(formData);
  }

  const handleAttendees = async () => {
    const startHour = startHourRef.current?.textContent || '00';
    const startMinute = startMinuteRef.current?.textContent || '00';
    const endHour = endHourRef.current?.textContent || '00';
    const endMinute = endMinuteRef.current?.textContent || '00';

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
      startHour,
      startMinute,
      endHour,
      endMinute,
      membership: true,
    };

    const res = await fetch(`/api/attendees/`, {
      method: 'PATCH',
      body: JSON.stringify({ id, newAttendees }),
    }).then((res) => res.json());

    console.log(res);

    // // ✅ 결과 출력
    // console.log('Start Time:', startTime);
    // console.log('End Time:', endTime);
    // console.log('같은 시간인가?', isSameTime);
    // console.log('시작시간이 종료시간보다 늦나?', isStartTimeAfterEndTime);
    // console.log('시간 차이 (분):', timeDifferenceMinutes);
  };

  const startHourRef = useRef<HTMLButtonElement>(null);
  const startMinuteRef = useRef<HTMLButtonElement>(null);
  const endHourRef = useRef<HTMLButtonElement>(null);
  const endMinuteRef = useRef<HTMLButtonElement>(null);

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
      {data && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pb-[80px]"
          >
            <div>
              <Label className="w-full">참석 시간</Label>
              <div className="flex gap-x-2 items-center">
                <Select defaultValue={data.startTime}>
                  <SelectTrigger ref={startHourRef}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(
                      {
                        length:
                          parseInt(data.endTime, 10) -
                          parseInt(data.startTime, 10),
                      },
                      (_, idx) => (
                        <SelectItem
                          value={String(parseInt(data.startTime, 10) + idx)}
                          key={idx}
                        >
                          {String(parseInt(data.startTime, 10) + idx)}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>

                <Select defaultValue="00" name="">
                  <SelectTrigger ref={startMinuteRef}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="00">00</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                  </SelectContent>
                </Select>
                <span>~</span>
                <Select defaultValue={data.endTime}>
                  <SelectTrigger ref={endHourRef}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(
                      {
                        length:
                          parseInt(data.endTime, 10) -
                          parseInt(data.startTime, 10),
                      },
                      (_, idx) => (
                        <SelectItem
                          value={String(parseInt(data.startTime, 10) + idx + 1)}
                          key={idx}
                        >
                          {String(parseInt(data.startTime, 10) + idx + 1)}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <Select defaultValue="00">
                  <SelectTrigger ref={endMinuteRef}>
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
                onClick={handleAttendees}
              >
                참석시간 등록
              </Button>
            </div>
            <FormDatePicker form={form} />

            <FormSelectTime
              name="startTime"
              form={form}
              label="시작 시간"
              value={data?.startTime}
            />
            <FormSelectTime
              name="endTime"
              form={form}
              label="종료 시간"
              startTime={parseInt(data?.startTime, 10)}
              value={data?.endTime}
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
