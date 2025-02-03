import { z } from 'zod';

export const ScheduleFormSchema = z.object({
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
  otherCourtName: z.string().optional(),
  courtCount: z.string({
    required_error: '코트 수 입력해주세요.',
  }),
  courtNumbers: z.array(
    z.object({
      number: z.string({
        required_error: '코트 번호를 입력해주세요.', 
      })
    })
  ),
  attendees: z
    .array(
      z.object({
        name: z.string(),
        gender: z.string(),
        startTime: z.string(),
        endTime: z.string(),
        membership: z.boolean(),
      })
    )
    .optional()
    .default([]),
});

export type ScheduleFormType = z.infer<typeof ScheduleFormSchema>;

export const GetScheduleSchema = ScheduleFormSchema.extend({
  id: z.string(), // _id 추가
});

export type GetScheduleType = z.infer<typeof GetScheduleSchema>;
