/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { use, useEffect, useState } from 'react';
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

      alert('일정이 성공적으로 업데이트되었습니다.');
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
            {form
              .watch('courtNumbers')
              ?.map((_, idx) => (
                <Input
                  key={idx}
                  type="text"
                  {...form.register(`courtNumbers.${idx}`)}
                />
              ))}

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
