import { ScheduleFormType } from '@/model/schedule';
import { ControllerRenderProps, UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useState } from 'react';
import { Input } from './ui/input';

type FormProps = {
  form: UseFormReturn<ScheduleFormType>;
};

export default function FormCourtName({ form }: FormProps) {
  const [useCourtName, setUseCourtName] = useState<boolean>(false);
  const [useCoourtNameValue, setUseCourtNameValue] = useState<string>('');
  function handleSelectChange(
    select: string,
    field: ControllerRenderProps<ScheduleFormType>
  ) {
    field.onChange(select);
    if (select === '직접입력') {
      setUseCourtName(true);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { value } = e.target;
    setUseCourtNameValue(value);
    form.setValue('courtName', value);
  }
  return (
    <>
      <FormField
        control={form.control}
        name="courtName"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>코트 이름</FormLabel>
            <FormControl>
              <Select
                onValueChange={(select) => {
                  handleSelectChange(select, field);
                  // field.onChange(select);
                }}
                defaultValue={field.value}
              >
                <SelectTrigger>
                  <SelectValue placeholder="코트를 선택해주세요" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="그랜드슬램">그랜드슬램</SelectItem>
                  <SelectItem value="망원한강공원">망원한강공원</SelectItem>
                  <SelectItem value="직접입력">직접입력</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {useCourtName && (
        <Input
          type="text"
          value={useCoourtNameValue}
          onChange={handleInputChange}
        />
      )}
    </>
  );
}
