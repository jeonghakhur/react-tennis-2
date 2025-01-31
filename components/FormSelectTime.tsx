import { ScheduleFormType } from '@/model/schedule';
import { FormField, FormItem, FormLabel } from './ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { UseFormReturn } from 'react-hook-form';
import { useEffect } from 'react';

// type SelectTimeFormProps = {
//   form: UseFormReturn<ScheduleFormType>;
//   name: keyof ScheduleFormType;
// };

type SelectTimeFormProps = {
  form: UseFormReturn<ScheduleFormType>; // ✅ `startTime`만 포함
  name: keyof ScheduleFormType;
  startTime?: number;
  label: string;
  value?: string | undefined;
};

export default function FormSelectTime({
  form,
  name,
  startTime = 19,
  label,
}: SelectTimeFormProps) {
  function timeFormat(value: number): string {
    return value.toString().padStart(2, '0'); // ✅ `0`을 앞에 붙여 2자리 문자열로 변환
  }

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        console.log(field.value, typeof field.value, name);
        return (
          <FormItem className="flex flex-col">
            <FormLabel>{label}</FormLabel>
            <Select onValueChange={field.onChange} value={String(field.value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="start" className="h-[200px]">
                {name === 'startTime'
                  ? Array.from({ length: 24 - 6 + 1 }, (_, i) => (
                      <SelectItem value={`${6 + i}`} key={`startTime_${i}`}>
                        {timeFormat(6 + i)}
                      </SelectItem>
                    ))
                  : Array.from({ length: 24 - startTime }, (_, i) => (
                      <SelectItem
                        value={`${startTime + i + 1}`}
                        key={`endTime_${i}`}
                      >
                        {timeFormat(startTime + i + 1)}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
          </FormItem>
        );
      }}
    />
  );
}
