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

const frameworks = [
  {
    value: 'next.js',
    label: 'Next.js',
  },
  {
    value: 'sveltekit',
    label: 'SvelteKit',
  },
  {
    value: 'nuxt.js',
    label: 'Nuxt.js',
  },
  {
    value: 'remix',
    label: 'Remix',
  },
  {
    value: 'astro',
    label: 'Astro',
  },
];

const FormSchema = z.object({
  date: z.date({
    required_error: '날짜를 입력해주세요.',
  }),
  courtName: z.string({
    required_error: '코트명을 입력해주세요.',
  }),
  courtCount: z.string({
    required_error: '코트수 입력해주세요.',
  }),
  courtNumbers: z.array(
    z.string({
      required_error: '코트번호를 입력해주세요.',
    }),
  ),
  // startTime: z.string(),
  // endTime: z.string(),
  // gameDuration: z.string(),
  // attendees: z.array(z.string()).optional(),
});

type OnSelectHandler = (select: Date | undefined, field: ControllerRenderProps<z.infer<typeof FormSchema>>) => void;

export default function CalendarForm() {
  const [popoverOpen, setpopoverOpen] = useState(false);
  const [courtInputs, setCourtInputs] = useState<string[]>([]);
  const [memberInputs, setMemberInputs] = useState<string[]>([]);
  const [popoverMembersOpen, setPopoverMembersOpen] = useState(false);
  const [membersValue, setMembersValue] = useState('');

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

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
    const updatedCourtNumbers = Array.from({ length: countNumber }, (_, i) => `${i + 1}`));
    form.setValue('courtNumbers', updatedCourtNumbers);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-[360px] p-8">
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
            <Popover open={popoverMembersOpen} onOpenChange={setPopoverMembersOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={popoverMembersOpen}
                  className=" justify-between"
                >
                  {membersValue
                    ? frameworks.find((framework) => framework.value === membersValue)?.label
                    : 'Select framework...'}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className=" p-0">
                <Command>
                  <CommandInput placeholder="Search framework..." />
                  <CommandList>
                    <CommandEmpty>No framework found.</CommandEmpty>
                    <CommandGroup>
                      {frameworks.map((framework) => (
                        <CommandItem
                          key={framework.value}
                          value={framework.value}
                          onSelect={(currentValue) => {
                            setMembersValue(currentValue);
                            if (!memberInputs.includes(currentValue)) {
                              setMemberInputs((pre) => [...pre, currentValue]);
                            }

                            setPopoverMembersOpen(false);
                          }}
                        >
                          {framework.label}
                          <Check
                            className={cn('ml-auto', membersValue === framework.value ? 'opacity-100' : 'opacity-0')}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </FormControl>
        </FormItem>
        {memberInputs.map((value, idx) => (
          <FormField
            key={idx}
            control={form.control}
            name={`attendees.${idx}`}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormControl>
                  <Input {...field} value={value} placeholder={field.value} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        {/* <FormField
          control={form.control}
          name={`attendee`}
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>참석자 직접입력</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}

