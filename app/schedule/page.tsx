/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Grid } from 'react-loader-spinner';
import { cn } from '@/lib/utils';
// import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useRouter } from 'next/navigation';
import { ScheduleFormSchema, ScheduleFormType } from '@/model/schedule';
import FormDatePicker from '@/components/FormDatePicker';
import FormSelectTime from '@/components/FormSelectTime';
import FormCourtName from '@/components/FormCourtName';
import { mutate } from 'swr';
import useSchedule from '@/hooks/schedule';

const memberList = [
  {
    name: '김성재',
    gender: '남성',
    startHour: '19',
    startMinute: '30',
    endHour: '21',
    endMinute: '00',
  },
  {
    name: '김은아',
    gender: '여성',
    startHour: '20',
    startMinute: '00',
    endHour: '22',
    endMinute: '00',
  },
  {
    name: '김진환',
    gender: '남성',
    startHour: '19',
    startMinute: '00',
    endHour: '21',
    endMinute: '30',
  },
  {
    name: '나리메',
    gender: '여성',
    startHour: '19',
    startMinute: '00',
    endHour: '22',
    endMinute: '00',
  },
  {
    name: '목진성',
    gender: '남성',
    startHour: '19',
    startMinute: '00',
    endHour: '22',
    endMinute: '00',
  },
  {
    name: '박정선',
    gender: '여성',
    startHour: '19',
    startMinute: '00',
    endHour: '22',
    endMinute: '00',
  },
  {
    name: '박정필',
    gender: '남성',
    startHour: '19',
    startMinute: '00',
    endHour: '22',
    endMinute: '00',
  },
  {
    name: '박현천',
    gender: '남성',
    startHour: '19',
    startMinute: '00',
    endHour: '22',
    endMinute: '00',
  },
  {
    name: '손상미',
    gender: '여성',
    startHour: '19',
    startMinute: '00',
    endHour: '22',
    endMinute: '00',
  },
  {
    name: '송호석',
    gender: '남성',
    startHour: '19',
    startMinute: '00',
    endHour: '22',
    endMinute: '00',
  },
  {
    name: '양진용',
    gender: '남성',
    startHour: '19',
    startMinute: '00',
    endHour: '22',
    endMinute: '00',
  },
  {
    name: '윤슬',
    gender: '여성',
    startHour: '19',
    startMinute: '00',
    endHour: '22',
    endMinute: '00',
  },
  {
    name: '이금순',
    gender: '여성',
    startHour: '19',
    startMinute: '00',
    endHour: '22',
    endMinute: '00',
  },
  {
    name: '이덕희',
    gender: '남성',
    startHour: '19',
    startMinute: '00',
    endHour: '22',
    endMinute: '00',
  },
  {
    name: '이명진',
    gender: '남성',
    startHour: '19',
    startMinute: '00',
    endHour: '22',
    endMinute: '00',
  },
  {
    name: '이범영',
    gender: '남성',
    startHour: '19',
    startMinute: '00',
    endHour: '22',
    endMinute: '00',
  },
  {
    name: '이원태',
    gender: '남성',
    startHour: '19',
    startMinute: '00',
    endHour: '22',
    endMinute: '00',
  },
  {
    name: '이은하',
    gender: '여성',
    startHour: '19',
    startMinute: '00',
    endHour: '22',
    endMinute: '00',
  },
  {
    name: '이태호',
    gender: '남성',
    startHour: '19',
    startMinute: '00',
    endHour: '22',
    endMinute: '00',
  },
  {
    name: '이현우',
    gender: '남성',
    startHour: '19',
    startMinute: '00',
    endHour: '22',
    endMinute: '00',
  },
  {
    name: '이현철',
    gender: '남성',
    startHour: '19',
    startMinute: '00',
    endHour: '22',
    endMinute: '00',
  },
  {
    name: '장영숙',
    gender: '여성',
    startHour: '19',
    startMinute: '00',
    endHour: '22',
    endMinute: '00',
  },
  {
    name: '장진석',
    gender: '남성',
    startHour: '19',
    startMinute: '00',
    endHour: '22',
    endMinute: '00',
  },
  {
    name: '전소빈',
    gender: '여성',
    startHour: '19',
    startMinute: '00',
    endHour: '22',
    endMinute: '00',
  },
  {
    name: '정현수',
    gender: '여성',
    startHour: '19',
    startMinute: '00',
    endHour: '22',
    endMinute: '00',
  },
  {
    name: '조준형',
    gender: '남성',
    startHour: '19',
    startMinute: '00',
    endHour: '22',
    endMinute: '00',
  },
  {
    name: '하지원',
    gender: '여성',
    startHour: '19',
    startMinute: '00',
    endHour: '22',
    endMinute: '00',
  },
  {
    name: '한양연',
    gender: '여성',
    startHour: '19',
    startMinute: '00',
    endHour: '22',
    endMinute: '00',
  },
  {
    name: '허정학',
    gender: '남성',
    startHour: '19',
    startMinute: '00',
    endHour: '22',
    endMinute: '00',
  },
  {
    name: '홍성애',
    gender: '여성',
    startHour: '19',
    startMinute: '00',
    endHour: '22',
    endMinute: '00',
  },
];

export default function CalendarForm() {
  const [popoverMembersOpen, setPopoverMembersOpen] = useState(false);
  const [membersValue, setMembersValue] = useState('');
  const [guestField, setGuestField] = useState<boolean>(false);
  const [guestName, setGuestName] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
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

  const attendeeAppend = (
    name: string,
    gender: string,
    membership: boolean
  ) => {
    append({
      name,
      gender,
      startHour: attendanceTime.startHour,
      startMinute: attendanceTime.startMinute,
      endHour: attendanceTime.endHour,
      endMinute: attendanceTime.endMinute,
      membership,
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

    console.log('attendees', data);
    postSchedule(data)
      .then((data) => console.log(data))
      .catch((error) => console.error(error))
      .finally(() => {
        setLoading(false);
        router.push('/');
      });

    // ✅ Optimistic UI: 새 데이터를 먼저 로컬 캐시에 추가 (임시 ID 생성)
    // const optimisticSchedule = { ...data, id: Date.now().toString() };

    // // ✅ 데이터를 추가하면서 정렬 적용 (등록 후 UI가 정렬됨)
    // mutate(
    //   '/api/schedule',
    //   (currentData: any) =>
    //     [...(currentData || []), optimisticSchedule].sort(
    //       (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    //     ),
    //   false
    // );

    // fetch('/api/schedule/', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(data),
    // })
    //   .then(async (res) => {
    //     if (!res.ok) {
    //       const errorResponse = await res.json(); // JSON 응답을 읽음
    //       setError(
    //         `${res.status} ${res.statusText}: ${errorResponse.message || 'Unknown error'}`
    //       );
    //       return;
    //     }

    //     return res.json(); // 성공 응답 처리
    //   })
    //   .then((newSchedule) => {
    //     console.log('✅ 등록 성공:', newSchedule);

    //     // ✅ 서버에서 최신 데이터 가져오기 (추가된 데이터 확인)
    //     mutate('/api/schedule');

    //     router.push('/'); // ✅ 리다이렉트
    //   })
    //   .catch((err) => {
    //     setError(`Error: ${err.message}`);
    //     console.error('Unexpected error:', err); // 네트워크 등 기타 에러
    //   })
    //   .finally(() => setLoading(false));
  }

  const handleCourtCountChange = (count: string) => {
    const countNumber = parseInt(count, 10);
    Array.from({ length: countNumber }, (_, idx) => {
      form.setValue(`courtNumbers.${idx}.number`, String(idx + 1));
    });
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
    const {
      name,
      gender,
      startHour,
      startMinute,
      endHour,
      endMinute,
      membership,
    } = fields[idx];
    if (membership) {
      memberList.push({
        name,
        gender,
        startHour,
        startMinute,
        endHour,
        endMinute,
      });
      memberList.sort((a, b) => a.name.localeCompare(b.name));
    }
    remove(idx);
  };

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
      {error && <p>{error}</p>}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-5">
        <FormDatePicker form={form} />
        <FormSelectTime
          form={form}
          name="startTime"
          startTime={startTime}
          label="코트 사용 시작 시간"
        />
        <FormSelectTime
          form={form}
          name="endTime"
          startTime={startTime}
          label="코트 사용 종료 시간"
        />
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
        {Array.from(
          { length: parseInt(form.watch('courtCount'), 10) },
          (_, idx) => (
            <FormField
              key={idx}
              control={form.control}
              name={`courtNumbers.${idx}.number`}
              render={({ field }) => {
                return (
                  <FormItem className="flex flex-col">
                    <FormLabel>{`코트 번호 ${idx + 1}`}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          )
        )}

        <FormItem className="flex flex-col">
          <FormLabel>참석자 및 참석 시간 선택</FormLabel>
          <FormControl>
            <div className="flex">
              <Popover
                open={popoverMembersOpen}
                onOpenChange={setPopoverMembersOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={popoverMembersOpen}
                    className="flex-1 mr-2 justify-between"
                  >
                    {membersValue === '직접입력'
                      ? '직접입력'
                      : memberList.find((item) => item.name === membersValue)
                          ?.name || '참석자를 선택해주세요.'}
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
                          <Check
                            className={cn(
                              'ml-auto',
                              membersValue === '직접입력'
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
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
                              className={cn(
                                'ml-auto',
                                membersValue === member.name
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
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
          className="w-full"
          type="button"
          variant="secondary"
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
                    {field.startHour}:{field.startMinute}~{field.endHour}:
                    {field.endMinute}
                  </td>
                  <td>
                    <Button
                      type="button"
                      size="xs"
                      variant="destructive"
                      onClick={() => handleAttendeeRemove(idx)}
                    >
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
