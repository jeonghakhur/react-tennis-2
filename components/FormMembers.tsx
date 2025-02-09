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
import { FormItem } from './ui/form';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Button } from './ui/button';

export default function FormMembers() {
  const { data: members, isLoading } = useSWR<UserProps[]>('/api/members');
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);
  const [guestField, setGuestField] = useState<boolean>(false);
  const [memberValue, setMemberValue] = useState<string>('');
  const guestNameRef = useRef<HTMLInputElement>(null);
  const genderRef = useRef<HTMLButtonElement>(null);

  const handleMemberChange = (member: string) => {
    if (member === '직접입력') {
      setGuestField(true);
    } else {
      setGuestField(false);
    }
    setMemberValue(member);
    setPopoverOpen(false);
  };

  function handleAddMember() {
    console.log(guestNameRef.current?.value, genderRef.current?.textContent);
  }

  return (
    <div>
      {!isLoading && (
        <>
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
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
              <Command>
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
                        key={member.name}
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
                />
                <Select>
                  <SelectTrigger className="basis-[100px]" ref={genderRef}>
                    <SelectValue placeholder="성별" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="남성">남성</SelectItem>
                    xx <SelectItem value="여성">여성</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </FormItem>
          )}
          <Button variant="outline" onClick={handleAddMember} type="button">
            참석자 등록
          </Button>
        </>
      )}
    </div>
  );
}
