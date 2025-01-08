'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Check, ChevronsUpDown } from 'lucide-react';
import { useForm, ControllerRenderProps } from 'react-hook-form';
import { z } from 'zod';

import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

const memberList = [
  { value: '허정학', label: '허정학' },
  { value: '윤슬', label: '윤슬' },
  { value: '이금순', label: '이금순' },
  { value: '김성재', label: '김성재' },
  { value: '김은아', label: '김은아' },
  { value: '김진환', label: '김진환' },
  { value: '목진성', label: '목진성' },
  { value: '박정선', label: '박정선' },
  { value: '박정필', label: '박정필' },
  { value: '박현천', label: '박현천' },
  { value: '이범영', label: '이범영' },
  { value: '송호석', label: '송호석' },
  { value: '양진용', label: '양진용' },
  { value: '이은하', label: '이은하' },
  { value: '이덕희', label: '이덕희' },
  { value: '이원태', label: '이원태' },
  { value: '이태호', label: '이태호' },
  { value: '이현우', label: '이현우' },
  { value: '이현철', label: '이현철' },
  { value: '장영숙', label: '장영숙' },
  { value: '장진석', label: '장진석' },
  { value: '전소빈', label: '전소빈' },
  { value: '조준형', label: '조준형' },
  { value: '하지원', label: '하지원' },
  { value: '한양연', label: '한양연' },
  { value: '정현수', label: '정현수' },
  { value: '홍성애', label: '홍성애' },
  { value: '이명진', label: '이명진' },
  { value: '나리메', label: '나리메' },
  { value: '손상미', label: '손상미' },
];

memberList.sort((a, b) => a.label.localeCompare(b.label));

const FormSchema = z.object({
  date: z.date({
    required_error: '코트 이용 날짜를 입력해주세요.',
  }),
  startTime: z.string({
    required_error: '코트 이용 시작 시간 입력해주세요.',
  }),
  endTime: z.string({
    required_error: '코트 이용 종료 시간 입력해주세요.',
  }),
  courtName: z.string({
    required_error: '코트장 이름을 입력해주세요.',
  }),
  courtCount: z.string({
    required_error: '코트 수 입력해주세요.',
  }),
  courtNumbers: z.array(
    z.string({
      required_error: '코트 번호를 입력해주세요.',
    }),
  ),
});

type OnSelectHandler = (select: Date | undefined, field: ControllerRenderProps<z.infer<typeof FormSchema>>) => void;

export default function CalendarForm() {
  const [popoverOpen, setpopoverOpen] = useState(false);
  const [memberInputs, setMemberInputs] = useState<string[]>([]);
  const [popoverMembersOpen, setPopoverMembersOpen] = useState(false);
  const [membersValue, setMembersValue] = useState('');

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      startTime: '19',
      endTime: '22',
    },
  });

  const startTime = parseInt(form.watch('startTime'), 10);
  const endTime = parseInt(form.watch('endTime'), 10);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(JSON.stringify(data, null, 2));
    toast({
      title: 'You submitted the following values:',
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  const handleDatePicker: OnSelectHandler = (select, field) => {
    field.onChange(select);
    setpopoverOpen(false);
  };

  const handleCourtCountChange = (count: string) => {
    form.setValue('courtCount', count);
    const countNumber = parseInt(count, 10);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const updatedCourtNumbers = Array.from({ length: countNumber }, (_, i) => `${i + 1}`);
    form.setValue('courtNumbers', updatedCourtNumbers);
  };

  function timeFormat(value: number): string {
    let newValue = value.toString();
    if (newValue.length === 1) {
      newValue = `0${newValue}`;
    }
    return newValue;
  }

  const handleMemberChange = (member: string) => {
    console.log('memberInputs', memberInputs);
    if (!memberInputs.includes(member)) {
      setMemberInputs((pre) => [...pre, member]);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-8">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>날짜 입력</FormLabel>
              <Popover open={popoverOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn('pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                      onClick={() => setpopoverOpen(true)}
                    >
                      {field.value ? format(field.value, 'yyyy.MM.dd') : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(select) => handleDatePicker(select, field)}
                    disabled={(date) => {
                      const today = new Date();
                      const yesterday = new Date(today);
                      yesterday.setDate(today.getDate() - 1);
                      return date < yesterday;
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="startTime"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>코트 사용 시작 시간</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start">
                  {Array.from({ length: 24 - 6 + 1 }, (_, i) => (
                    <SelectItem value={`${6 + i}`} key={`startTime_${i}`}>
                      {timeFormat(6 + i)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="endTime"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>코트 사용 종료 시간</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 - startTime }, (_, i) => (
                    <SelectItem value={`${startTime + i + 1}`} key={`endTime_${i}`}>
                      {timeFormat(startTime + i + 1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        {form.watch('date') && (
          <FormField
            control={form.control}
            name="courtName"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>코트 이름</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={(select) => {
                      field.onChange(select);
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
        )}
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
        {(form.watch('courtNumbers') || []).map((_, idx) => (
          <FormField
            key={idx}
            control={form.control}
            name={`courtNumbers.${idx}`}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{`코트 번호 ${idx + 1}`}</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value} placeholder={`코트 번호 ${idx + 1}`} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        {/* <FormField
          control={form.control}
          name={`courtNumbers`}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>코트 이용시간 선택</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}
        <FormItem className="flex flex-col">
          <FormLabel>참석자 선택</FormLabel>
          <FormControl>
            <div className="flex">
              <Popover open={popoverMembersOpen} onOpenChange={setPopoverMembersOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={popoverMembersOpen}
                    className="flex-1 mr-2 justify-between"
                  >
                    {membersValue
                      ? memberList.find((memberList) => memberList.value === membersValue)?.label
                      : '참석자를 선택해주세요'}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent align="start" className="h-[300px]">
                  <Command>
                    <CommandInput placeholder="Search member" />
                    <CommandList>
                      <CommandEmpty>No member found.</CommandEmpty>
                      <CommandGroup>
                        {memberList.map((member) => (
                          <CommandItem
                            key={member.value}
                            value={member.value}
                            onSelect={(currentValue) => {
                              setMembersValue(currentValue);
                              setPopoverMembersOpen(false);
                            }}
                          >
                            {member.label}
                            <Check
                              className={cn('ml-auto', membersValue === member.value ? 'opacity-100' : 'opacity-0')}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <Button type="button" variant="outline" onClick={() => handleMemberChange(membersValue)}>
                추가
              </Button>
            </div>
          </FormControl>
        </FormItem>

        <table className="table">
          <thead>
            <tr>
              <th>번호</th>
              <th>참석자명</th>
              <th>성별</th>
              <th>참석시간</th>
            </tr>
          </thead>
          <tbody>
            {memberInputs.map((value, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>{value}</td>
                <td>-</td>
                <td>-</td>
              </tr>
            ))}
          </tbody>
        </table>

        <FormItem>
          <FormLabel>참석자 집접 입력</FormLabel>
          <div className="flex gap-x-2">
            <Input type="text" placeholder="참석자 이름을 입력해주세요." className="flex-1 text-sm" />
          </div>
        </FormItem>

        <FormItem>
          <FormLabel>성별 선택</FormLabel>
          <Select>
            <SelectTrigger className="basis-[70px]">
              <SelectValue placeholder="성별" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="M">남성</SelectItem>
              <SelectItem value="F">여성</SelectItem>
            </SelectContent>
          </Select>
          <FormLabel>구력 선택</FormLabel>
          <Select>
            <SelectTrigger className="basis-[70px]">
              <SelectValue placeholder="구력" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1년</SelectItem>
              <SelectItem value="2">2년</SelectItem>
            </SelectContent>
          </Select>
          <FormLabel>NTRP 선택</FormLabel>
          <Select>
            <SelectTrigger className="basis-[70px]">
              <SelectValue placeholder="NTRP" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1.0</SelectItem>
              <SelectItem value="2">1.5</SelectItem>
            </SelectContent>
          </Select>
        </FormItem>
        <FormItem>
          <FormLabel>참석자 참석시간</FormLabel>
          <div className="flex gap-x-2 items-center">
            <Select defaultValue={`${startTime}`}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: endTime - startTime + 1 }, (_, idx) => (
                  <SelectItem value={`${startTime + idx}`} key={idx}>
                    {startTime + idx}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select defaultValue="00">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="00">00</SelectItem>
                <SelectItem value="30">30</SelectItem>
              </SelectContent>
            </Select>
            <span>~</span>
            <Select defaultValue={`${startTime}`}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: endTime - startTime + 1 }, (_, idx) => (
                  <SelectItem value={`${startTime + idx}`} key={idx}>
                    {startTime + idx}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select defaultValue="00">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="00">00</SelectItem>
                <SelectItem value="30">30</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </FormItem>

        <Button type="submit" className="w-full bg-blue-600">
          일정 등록
        </Button>
      </form>
    </Form>
  );
}

