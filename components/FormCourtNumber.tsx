import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { ScheduleFormType } from '@/model/schedule';
import FormSelectTime from './FormSelectTime';

type FormProps = {
  form: UseFormReturn<ScheduleFormType>;
  idx: number;
};

export default function FormCourtNumber({ form, idx }: FormProps) {
  // 전체 운동 시작/종료시간을 가져옴
  const globalStart = form.watch('startTime') || '19';
  const globalEnd = form.watch('endTime') || '22';
  console.log('courtNumbers', form.watch('courtNumbers'));

  return (
    <div className="flex flex-col flex-1 gap-2 border p-2 rounded-md">
      <FormField
        key={idx}
        control={form.control}
        name={`courtNumbers.${idx}.number`}
        render={({ field }) => (
          <FormItem className="flex flex-col flex-1">
            <FormLabel>{`코트 번호 ${idx + 1}`}</FormLabel>
            <Input
              {...field}
              value={field.value ?? ''}
              placeholder={`코트 번호 ${idx + 1}`}
            />
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex gap-2">
        <FormSelectTime
          form={form}
          name={`courtNumbers.${idx}.startTime`}
          label="시작시간"
          startTime={parseInt(globalStart, 10)}
          endTime={parseInt(globalEnd, 10)}
          onChange={(val) =>
            form.setValue(`courtNumbers.${idx}.startTime`, val, {
              shouldValidate: true,
            })
          }
        />
        <FormSelectTime
          form={form}
          name={`courtNumbers.${idx}.endTime`}
          label="종료시간"
          startTime={parseInt(globalStart, 10)}
          endTime={parseInt(globalEnd, 10)}
          value={form.watch(`courtNumbers.${idx}.endTime`) || globalEnd}
          onChange={(val) =>
            form.setValue(`courtNumbers.${idx}.endTime`, val, {
              shouldValidate: true,
            })
          }
        />
      </div>
    </div>
  );
}
