'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Grid } from 'react-loader-spinner';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { ScheduleFormSchema, ScheduleFormType } from '@/model/schedule';
import FormDatePicker from '@/components/FormDatePicker';
import FormSelectTime from '@/components/FormSelectTime';
import FormCourtName from '@/components/FormCourtName';
import useSchedule from '@/hooks/useSchedule';
import FormMembers from '@/components/FormMembers';
import FormCourtNumber from '@/components/FormCourtNumber';
import { Switch } from '@/components/ui/switch';

export default function CalendarForm() {
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { postSchedule } = useSchedule();

  const form = useForm<ScheduleFormType>({
    resolver: zodResolver(ScheduleFormSchema),
    defaultValues: {
      date: new Date(),
      startTime: '19',
      endTime: '22',
      attendees: [],
    },
  });

  const startTime = parseInt(form.watch('startTime'), 10);

  function onSubmit(data: ScheduleFormType) {
    setLoading(true);

    if (data.courtName === '직접입력') {
      if (!data.otherCourtName) {
        alert('코트명을 입력해주세요!');
        setLoading(false);
        return;
      }
      data.courtName = data.otherCourtName;
    }

    postSchedule(data)
      .then((data) => console.log(data))
      .catch((error) => console.error(error))
      .finally(() => {
        setLoading(false);
        router.push('/');
      });
  }

  const handleCourtCountChange = (count: string) => {
    const countNumber = parseInt(count, 10);
    Array.from({ length: countNumber }, (_, idx) => {
      form.setValue(`courtNumbers.${idx}.number`, String(idx + 1));
    });
  };

  return (
    <Form {...form}>
      {loading && (
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-5">
        <div className="flex items-align justify-between">
          <FormLabel>참석투표시작</FormLabel>
          <Switch
            onCheckedChange={(value) => {
              form.setValue('voting', value);
            }}
          />
        </div>
        <FormDatePicker form={form} />
        <div className="grid grid-cols-2 gap-3">
          <FormSelectTime
            form={form}
            name="startTime"
            startTime={startTime}
            label="시작시간"
          />
          <FormSelectTime
            form={form}
            name="endTime"
            startTime={startTime}
            label="종료시간"
          />
        </div>
        <FormCourtName form={form} />
        {form.watch('courtName') && (
          <FormField
            control={form.control}
            name="courtCount"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>코트 수</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleCourtCountChange(value);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="코트 수를 선택하세요." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <div className="flex gap-3">
          {Array.from(
            { length: parseInt(form.watch('courtCount'), 10) },
            (_, idx) => (
              <FormCourtNumber key={idx} form={form} idx={idx} />
            )
          )}
        </div>

        <FormMembers form={form} attendees={form.watch('attendees')} />

        <Button type="submit" className="w-full bg-blue-600">
          일정 등록
        </Button>
      </form>
    </Form>
  );
}
