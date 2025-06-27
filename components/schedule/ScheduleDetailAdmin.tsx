'use client';

import FormCourtCount from '@/components/FormCourtCount';
import FormCourtNumber from '@/components/FormCourtNumber';
import FormDatePicker from '@/components/FormDatePicker';
import FormMembers from '@/components/FormMembers';
import FormSelectTime from '@/components/FormSelectTime';
import { Container } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import useSchedule from '@/hooks/useSchedule';
import {
  ScheduleFormSchema,
  ScheduleFormType,
  AttendanceProps,
} from '@/model/schedule';
import { AuthUser } from '@/model/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Grid } from 'react-loader-spinner';
import CommentSection from '@/components/common/CommentSection';
import { mutate } from 'swr';

type Props = {
  scheduleId: string;
  user: AuthUser;
};

export default function ScheduleDetailAdmin({ scheduleId, user }: Props) {
  const userName = user?.name;
  const gender = user?.gender;
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const {
    schedule,
    isLoading,
    patchSchedule,
    removeSchedule,
    addComment,
    removeComment,
  } = useSchedule(scheduleId);

  const form = useForm<ScheduleFormType>({
    resolver: zodResolver(ScheduleFormSchema),
  });

  useEffect(() => {
    if (schedule) {
      console.log(schedule);
      form.reset({
        ...schedule,
        date: schedule.date ? new Date(schedule.date) : new Date(),
        // courtNumbers: schedule.courtNumbers.map((court) =>
        //   typeof court === 'string' ? court : court.number
        // ),
        attendees: (schedule.attendees || []).map((att) => ({
          ...att,
          userId: att.userId || '',
        })),
      });
    }
  }, [schedule, form, userName, gender]);

  useEffect(() => {
    if (Object.keys(form.formState.errors).length > 0) {
      console.log(form.formState.errors);
      toast({
        title: '입력 오류',
        description: '모든 필수 항목을 입력해주세요.',
        variant: 'destructive',
      });
    }
  }, [form.formState.errors]);

  const handleDelete = () => {
    const isConfirmed = confirm('정말 삭제하시겠습니까?');
    if (isConfirmed) {
      setLoading(true);
      removeSchedule()
        .then((data) => console.log(data))
        .catch((error) => console.error(error))
        .finally(() => {
          setLoading(false);
          router.push('/');
        });
    }
  };

  async function onSubmit(data: ScheduleFormType) {
    setLoading(true);
    try {
      await patchSchedule(data);
      await mutate('/api/schedule', undefined, { revalidate: true });
      router.push('/schedule');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handleCourtCountChange = (count: string) => {
    const countNumber = parseInt(count, 10);
    const currentCourtNumbers = form.getValues('courtNumbers') || [];
    const defaultStart = form.watch('startTime') || '19';
    const defaultEnd = form.watch('endTime') || '22';

    if (countNumber > currentCourtNumbers.length) {
      const newCourts = Array.from(
        { length: countNumber - currentCourtNumbers.length },
        (_, idx) => ({
          number: String(currentCourtNumbers.length + idx + 1),
          startTime: defaultStart,
          endTime: defaultEnd,
        })
      );
      form.setValue('courtNumbers', [...currentCourtNumbers, ...newCourts]);
    } else if (countNumber < currentCourtNumbers.length) {
      form.setValue('courtNumbers', currentCourtNumbers.slice(0, countNumber));
    }
  };

  const handleStatusChange = (value: boolean) => {
    if (value) {
      form.setValue('status', 'attendees');
    } else {
      form.setValue('status', 'pending');
    }
  };

  return (
    <Container>
      {(loading || isLoading) && (
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
      {schedule && (
        <>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 mb-4"
            >
              <FormDatePicker form={form} />
              <div className="grid grid-cols-2 gap-4">
                <FormSelectTime
                  name="startTime"
                  form={form}
                  label="시작 시간"
                  value={schedule?.startTime}
                />
                <FormSelectTime
                  name="endTime"
                  form={form}
                  label="종료 시간"
                  startTime={parseInt(schedule?.startTime, 10)}
                  value={schedule?.endTime}
                />
              </div>

              <div>
                <Label>코트이름</Label>
                <Input type="text" {...form.register('courtName')} />
              </div>

              <div>
                <FormCourtCount
                  form={form}
                  value={schedule.courtCount}
                  onHandleChange={handleCourtCountChange}
                />
              </div>

              {/* <div className="flex gap-3">
                {Array.from(
                  { length: parseInt(form.watch('courtCount'), 10) },
                  (_, idx) => (
                    <FormCourtNumber key={idx} form={form} idx={idx} />
                  )
                )}
              </div> */}

              {form.watch('courtCount') && (
                <div className="flex gap-4">
                  {(form.watch('courtNumbers') || []).map((_, idx) => (
                    <FormCourtNumber key={idx} form={form} idx={idx} />
                  ))}
                </div>
              )}

              <FormMembers
                form={form}
                attendees={(
                  (form.watch('attendees') as AttendanceProps[]) || []
                ).map((att) => ({
                  ...att,
                  userId: typeof att.userId === 'string' ? att.userId : '',
                }))}
                startTime={Number(schedule.startTime)}
                endTime={Number(schedule.endTime)}
              />
              <div className="flex items-center gap-2 justify-between">
                <label htmlFor="status" className="font-bold">
                  참석자등록
                </label>
                <Switch
                  id="status"
                  name="status"
                  checked={form.watch('status') === 'attendees'}
                  onCheckedChange={handleStatusChange}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => handleDelete()}
                  className="flex-1"
                  size="lg"
                >
                  삭제
                </Button>
                <Button type="submit" className="flex-1" size="lg">
                  저장
                </Button>
              </div>
            </form>
          </Form>

          {/* 코멘트 섹션 */}
          <CommentSection
            comments={schedule.comments || []}
            currentUserId={user.id}
            currentUser={{
              name: user.name,
              username: user.userName,
              ...(user.image && { image: user.image }),
            }}
            onAddComment={async (comment) => {
              await addComment(comment);
            }}
            onRemoveComment={async (commentKey) => {
              await removeComment(commentKey);
            }}
            title="관리자 코멘트"
            placeholder="관리자 코멘트를 입력하세요..."
          />
        </>
      )}
    </Container>
  );
}
