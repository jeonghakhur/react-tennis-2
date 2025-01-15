'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Check, ChevronsUpDown } from 'lucide-react';
import { useForm, ControllerRenderProps, useFieldArray } from 'react-hook-form';
import { z } from 'zod';

import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

const memberList = [
  { name: '김성재', gender: '남성', startTime: '19:30', endTime: '21:00' },
  { name: '김은아', gender: '여성', startTime: '20:00', endTime: '22:00' },
  { name: '김진환', gender: '남성', startTime: '19:00', endTime: '21:30' },
  { name: '나리메', gender: '여성', startTime: '19:00', endTime: '22:00' },
  { name: '목진성', gender: '남성', startTime: '19:00', endTime: '22:00' },
  { name: '박정선', gender: '여성', startTime: '19:00', endTime: '22:00' },
  { name: '박정필', gender: '남성', startTime: '19:00', endTime: '22:00' },
  { name: '박현천', gender: '남성', startTime: '19:00', endTime: '22:00' },
  { name: '손상미', gender: '여성', startTime: '19:00', endTime: '22:00' },
  { name: '송호석', gender: '남성', startTime: '19:00', endTime: '22:00' },
  { name: '양진용', gender: '남성', startTime: '19:00', endTime: '22:00' },
  { name: '윤슬', gender: '여성', startTime: '19:00', endTime: '22:00' },
  { name: '이금순', gender: '여성', startTime: '19:00', endTime: '22:00' },
  { name: '이덕희', gender: '남성', startTime: '19:00', endTime: '22:00' },
  { name: '이명진', gender: '남성', startTime: '19:00', endTime: '22:00' },
  { name: '이범영', gender: '남성', startTime: '19:00', endTime: '22:00' },
  { name: '이원태', gender: '남성', startTime: '19:00', endTime: '22:00' },
  { name: '이은하', gender: '여성', startTime: '19:00', endTime: '22:00' },
  { name: '이태호', gender: '남성', startTime: '19:00', endTime: '22:00' },
  { name: '이현우', gender: '남성', startTime: '19:00', endTime: '22:00' },
  { name: '이현철', gender: '남성', startTime: '19:00', endTime: '22:00' },
  { name: '장영숙', gender: '여성', startTime: '19:00', endTime: '22:00' },
  { name: '장진석', gender: '남성', startTime: '19:00', endTime: '22:00' },
  { name: '전소빈', gender: '여성', startTime: '19:00', endTime: '22:00' },
  { name: '정현수', gender: '여성', startTime: '19:00', endTime: '22:00' },
  { name: '조준형', gender: '남성', startTime: '19:00', endTime: '22:00' },
  { name: '하지원', gender: '여성', startTime: '19:00', endTime: '22:00' },
  { name: '한양연', gender: '여성', startTime: '19:00', endTime: '22:00' },
  { name: '허정학', gender: '남성', startTime: '19:00', endTime: '22:00' },
  { name: '홍성애', gender: '여성', startTime: '19:00', endTime: '22:00' },
];

// memberList.sort((a, b) => a.name.localeCompare(b.name));

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
  attendees: z.array(
    z.object({
      name: z.string(),
      gender: z.string(),
      startTime: z.string(),
      endTime: z.string(),
      memberShip: z.boolean(),
    }),
  ),
});

type OnSelectHandler = (select: Date | undefined, field: ControllerRenderProps<z.infer<typeof FormSchema>>) => void;

export default function CalendarForm() {
  const [popoverOpen, setpopoverOpen] = useState(false);
  const [popoverMembersOpen, setPopoverMembersOpen] = useState(false);
  const [membersValue, setMembersValue] = useState('');
  const [guestField, setGuestField] = useState<boolean>(false);
  const [guestName, setGuestName] = useState<string>('');
  const [gender, setGender] = useState<string>('');

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      startTime: '19',
      endTime: '22',
      attendees: [],
    },
  });

  const startTime = parseInt(form.watch('startTime'), 10);
  const endTime = parseInt(form.watch('endTime'), 10);

  const [attendanceTime, setAttendanceTime] = useState({
    startHour: startTime.toString(),
    startMinute: '00',
    endHour: endTime.toString(),
    endMinute: '00',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'attendees',
  });

  const alreadyExists = (name: string) => {
    return fields.some((attendee) => attendee.name === name);
  };

  const attendeeAppend = (name: string, gender: string, memberShip: boolean) => {
    append({
      name,
      gender,
      startTime: `${attendanceTime.startHour}:${attendanceTime.startMinute}`,
      endTime: `${attendanceTime.endHour}:${attendanceTime.endMinute}`,
      memberShip,
    });
  };

  const handleAddMemberAttendee = () => {
    if (!membersValue) {
      alert('참석자를 선택해주세요!');
      return;
    }
    if (alreadyExists(membersValue)) {
      alert('이미 추가된 참석자입니다.');
      return;
    }

    const member = memberList.find((item) => item.name === membersValue);

    if (member) {
      const idx = memberList.findIndex((item) => item.name === member.name);
      const { name, gender } = member;
      attendeeAppend(name, gender, true);
      setMembersValue('');
      memberList.splice(idx, 1);
    } else {
      alert('알수 없는 오류입니다.');
    }
  };

  const handleAddGuestAttendee = () => {
    if (guestName === '') {
      alert('참석자 이름을 입력해주세요.');
      return;
    }
    if (gender === '') {
      alert('참석자 성별을 선택해주세요');
      return;
    }

    if (alreadyExists(guestName)) {
      alert('이미 추가된 참석자입니다.');
      return;
    }

    attendeeAppend(guestName, gender, false);

    setGuestName('');
    setGender('');
    setAttendanceTime({
      startHour: startTime.toString(),
      startMinute: '00',
      endHour: endTime.toString(),
      endMinute: '00',
    });
  };

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

  const handleMemberChange = (member: string) => {
    if (member === '직접입력') {
      setGuestField(true);
    } else {
      setGuestField(false);
    }
    setMembersValue(member);
    setPopoverMembersOpen(false);
  };

  const handleAttendeeRemove = (idx: number) => {
    const { name, gender, startTime, endTime, memberShip } = fields[idx];
    if (memberShip) {
      memberList.push({
        name,
        gender,
        startTime,
        endTime,
      });
      memberList.sort((a, b) => a.name.localeCompare(b.name));
    }
    remove(idx);
  };

  function timeFormat(value: number): string {
    let newValue = value.toString();
    if (newValue.length === 1) {
      newValue = `0${newValue}`;
    }
    return newValue;
  }

  useEffect(() => {
    setAttendanceTime((prev) => ({
      ...prev,
      startHour: startTime.toString(),
    }));
  }, [startTime]);

  useEffect(() => {
    setAttendanceTime((prev) => ({
      ...prev,
      endHour: endTime.toString(),
    }));
  }, [endTime]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-5">
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
                <SelectContent align="start" className="h-[200px]">
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
          <FormLabel>참석자 및 참석 시간 선택</FormLabel>
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
                    {membersValue === '직접입력'
                      ? '직접입력'
                      : memberList.find((item) => item.name === membersValue)?.name || '참석자를 선택해주세요.'}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent align="start" className="h-[300px]">
                  <Command>
                    <CommandInput placeholder="Search member" />
                    <CommandList>
                      <CommandEmpty>No member found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="직접입력"
                          onSelect={(currentValue) => {
                            handleMemberChange(currentValue);
                          }}
                        >
                          직접입력
                          <Check className={cn('ml-auto', membersValue === '직접입력' ? 'opacity-100' : 'opacity-0')} />
                        </CommandItem>
                        {memberList.map((member) => (
                          <CommandItem
                            key={member.name}
                            value={member.name}
                            onSelect={(currentValue) => {
                              handleMemberChange(currentValue);
                            }}
                          >
                            {member.name}
                            <Check
                              className={cn('ml-auto', membersValue === member.name ? 'opacity-100' : 'opacity-0')}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </FormControl>
        </FormItem>
        {guestField && (
          <FormItem>
            <div className="flex gap-x-2">
              <Input
                type="text"
                value={guestName}
                onChange={(e) => {
                  setGuestName(e.target.value);
                }}
                placeholder="참석자 이름을 입력해주세요."
                className="flex-1 text-sm"
              />
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="basis-[100px]">
                  <SelectValue placeholder="성별" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="남성">남성</SelectItem>
                  <SelectItem value="여성">여성</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </FormItem>
        )}

        <FormItem>
          <div className="flex gap-x-2 items-center">
            <Select
              value={attendanceTime.startHour}
              onValueChange={(value) => {
                setAttendanceTime((pre) => ({ ...pre, startHour: value }));
              }}
            >
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
            <Select
              value={attendanceTime.startMinute}
              onValueChange={(value) => {
                setAttendanceTime((pre) => ({ ...pre, startMinute: value }));
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
                setAttendanceTime((pre) => ({ ...pre, endHour: value }));
              }}
            >
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
            <Select
              value={attendanceTime.endMinute}
              onValueChange={(value) => {
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
        </FormItem>

        <Button
          className="w-full bg-gray-500"
          type="button"
          // variant="outline"
          onClick={() => {
            if (guestField) {
              handleAddGuestAttendee();
            } else {
              handleAddMemberAttendee();
            }
          }}
        >
          참석자 추가
        </Button>
        {fields.length > 0 && (
          <table className="table w-full text-center text-xs">
            <thead>
              <tr>
                <th>번호</th>
                <th>참석자명</th>
                <th>성별</th>
                <th>참석시간</th>
                <th>삭제</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{field.name}</td>
                  <td>{field.gender}</td>
                  <td>
                    {field.startTime}~{field.endTime}
                  </td>
                  <td>
                    <Button type="button" size="xs" variant="destructive" onClick={() => handleAttendeeRemove(idx)}>
                      삭제
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <Button type="submit" className="w-full bg-blue-600">
          일정 등록
        </Button>
      </form>
    </Form>
  );
}

