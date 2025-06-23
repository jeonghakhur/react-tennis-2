import { UserProps } from '@/model/user';
import { Check, ChevronsUpDown } from 'lucide-react';
import useSWR from 'swr';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { FormItem, FormLabel } from './ui/form';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Button } from './ui/button';
import { AttendanceProps, ScheduleFormType } from '@/model/schedule';
import {
  useFieldArray,
  UseFormReturn,
  FieldArrayWithId,
} from 'react-hook-form';

type Props = {
  form: UseFormReturn<ScheduleFormType>;
  attendees: AttendanceProps[];
  startTime: number;
  endTime: number;
};

export default function FormMembers({
  attendees,
  form,
  endTime,
  startTime,
}: Props) {
  const { data: members, isLoading } = useSWR<UserProps[]>('/api/members');

  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);
  const [guestField, setGuestField] = useState<boolean>(false);
  const [memberValue, setMemberValue] = useState<string>('');
  const guestNameRef = useRef<HTMLInputElement>(null);
  const genderRef = useRef<HTMLButtonElement>(null);
  const [memberGender, setMemberGender] = useState<string>('남성');

  const [attendanceTime, setAttendanceTime] = useState({
    startHour: String(startTime),
    startMinute: '00',
    endHour: String(endTime),
    endMinute: '00',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'attendees',
  });

  const isAttendee = (name: string, userId?: string) => {
    if (userId) {
      return fields.some(
        (attendee: FieldArrayWithId<ScheduleFormType, 'attendees', 'id'>) =>
          'userId' in attendee && attendee.userId === userId
      );
    }
    return fields.some(
      (attendee: FieldArrayWithId<ScheduleFormType, 'attendees', 'id'>) =>
        attendee.name === name
    );
  };

  const handleMemberChange = (member: string) => {
    if (member === '직접입력') {
      setGuestField(true);
      setMemberGender('남성');
    } else {
      setGuestField(false);
      const found = members?.find((item) => item.name === member);
      setMemberGender(found?.gender || '남성');
    }
    setMemberValue(member);
    setPopoverOpen(false);
  };

  function handleAddMember() {
    let name = '';
    let gender = memberGender;
    let userId = '';
    if (guestField) {
      name = guestNameRef.current?.value || '';
      gender = genderRef.current?.textContent || '남성';
      userId = '';
    } else {
      name = memberValue;
      const found = members?.find((item) => item.name === name);
      userId = found?.id || '';
    }
    if (!name) return;
    if (isAttendee(name, userId)) {
      alert('이미 추가된 참석자입니다.');
      return;
    }
    append({
      _key: crypto.randomUUID(),
      name,
      gender,
      userId: userId || '',
      startHour: attendanceTime.startHour,
      startMinute: attendanceTime.startMinute,
      endHour: attendanceTime.endHour,
      endMinute: attendanceTime.endMinute,
    } as AttendanceProps);

    // 직접 입력 필드 초기화
    if (guestField && guestNameRef.current) {
      guestNameRef.current.value = '';
    }
  }

  function handleRemoveMember(index: number) {
    remove(index);
  }

  return (
    <div>
      {!isLoading && (
        <div className="space-y-4">
          <div className="flex items-align justify-between">
            <FormLabel htmlFor="attendeesCheck">참석자 등록</FormLabel>
          </div>
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild className="w-full">
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={popoverOpen}
                className="flex-1 mr-2 justify-between"
              >
                {memberValue === '직접입력'
                  ? '직접입력'
                  : members?.find((item) => item.name === memberValue)?.name ||
                    '참석자를 선택해주세요.'}
                <ChevronsUpDown className="opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="h-[300px]">
              <Command className="w-full">
                <CommandInput placeholder="Search member" />
                <CommandList>
                  <CommandEmpty>No member found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="직접입력"
                      onSelect={(value) => {
                        handleMemberChange(value);
                      }}
                    >
                      직접입력
                      <Check
                        className={cn(
                          'ml-auto',
                          memberValue === '직접입력'
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                    </CommandItem>
                    {members?.map((member) => (
                      <CommandItem
                        key={member.id}
                        value={member.name}
                        onSelect={(value) => {
                          handleMemberChange(value);
                        }}
                      >
                        {member.name}
                        <Check
                          className={cn(
                            'ml-auto',
                            memberValue === member.name
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
          {guestField && (
            <FormItem>
              <div className="flex gap-x-2">
                <Input
                  type="text"
                  ref={guestNameRef}
                  placeholder="참석자 이름을 입력해주세요."
                  className="flex-1 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  onKeyUp={(e) => {
                    if (e.key === 'Enter' && guestNameRef.current?.value) {
                      e.preventDefault();
                      handleAddMember();
                      if (guestNameRef.current) {
                        guestNameRef.current.value = '';
                      }
                    }
                  }}
                />
                <Select defaultValue="남성">
                  <SelectTrigger className="basis-[100px]" ref={genderRef}>
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
                  if (!value) return;
                  setAttendanceTime((pre) => ({
                    ...pre,
                    startHour: value,
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: endTime - startTime }, (_, idx) => (
                    <SelectItem value={String(startTime + idx)} key={idx}>
                      {String(startTime + idx)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={attendanceTime.startMinute}
                onValueChange={(value) => {
                  if (!value) return;
                  setAttendanceTime((pre) => ({
                    ...pre,
                    startMinute: value,
                  }));
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
                  if (!value) return;
                  setAttendanceTime((pre) => ({ ...pre, endHour: value }));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: endTime - startTime }, (_, idx) => (
                    <SelectItem value={`${startTime + idx + 1}`} key={idx}>
                      {startTime + idx + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={attendanceTime.endMinute}
                onValueChange={(value) => {
                  if (!value) return;
                  setAttendanceTime((pre) => ({
                    ...pre,
                    endMinute: value,
                  }));
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
            variant="secondary"
            onClick={handleAddMember}
            type="button"
            className="w-full"
          >
            참석자 등록
          </Button>

          <div>
            {attendees && attendees.length > 0 && (
              <>
                <div>참석자 목록</div>
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
                    {attendees.map((field, idx) => (
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
                            onClick={() => handleRemoveMember(idx)}
                          >
                            삭제
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
