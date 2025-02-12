import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { ScheduleFormType } from '@/model/schedule';

type FormProps = {
  form: UseFormReturn<ScheduleFormType>;
  idx: number;
};

export default function FormCourtNumber({ form, idx }: FormProps) {
  return (
    <FormField
      key={idx}
      control={form.control}
      name={`courtNumbers.${idx}.number`}
      render={({ field }) => (
        <FormItem className="flex flex-col flex-1">
          <FormLabel>{`코트 번호 ${idx + 1}`}</FormLabel>

          <Input
            {...field}
            value={field.value}
            placeholder={`코트 번호 ${idx + 1}`}
          />

          <FormMessage />
        </FormItem>
      )}
    />
  );
}
