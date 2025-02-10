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
import useSchedule from '@/hooks/useSchedule';
import FormMembers from '@/components/FormMembers';

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

  const attendeeAppend = (name: string, gender: string) => {
    append({
      name,
      gender,
      startHour: attendanceTime.startHour,
      startMinute: attendanceTime.startMinute,
      endHour: attendanceTime.endHour,
      endMinute: attendanceTime.endMinute,
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
      attendeeAppend(name, gender);
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

    attendeeAppend(guestName, gender);

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
    // const {
    //   name,
    //   gender,
    //   startHour,
    //   startMinute,
    //   endHour,
    //   endMinute,
    // } = fields[idx];
    // if (membership) {
    //   memberList.push({
    //     name,
    //     gender,
    //     startHour,
    //     startMinute,
    //     endHour,
    //     endMinute,
    //   });
    //   memberList.sort((a, b) => a.name.localeCompare(b.name));
    // }
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

        <FormMembers form={form} attendees={form.watch('attendees')} />

        <Button type="submit" className="w-full bg-blue-600">
          일정 등록
        </Button>
      </form>
    </Form>
  );
}
