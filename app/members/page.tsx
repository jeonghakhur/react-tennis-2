'use client';
import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Zod 스키마 정의
const attendeeSchema = z.object({
  attendees: z.array(
    z.object({
      name: z.string().nonempty('이름은 필수 입력 항목입니다.'),
    })
  ),
});

type AttendeeFormValues = z.infer<typeof attendeeSchema>;

const MyForm = () => {
  const form = useForm<AttendeeFormValues>({
    resolver: zodResolver(attendeeSchema),
    defaultValues: {
      attendees: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'attendees',
  });

  const [newAttendee, setNewAttendee] = useState({
    name: '',
  });

  const handleAddAttendee = () => {
    if (newAttendee.name === '') {
      console.log('not name');
      return;
    }
    append(newAttendee);

    setNewAttendee({
      name: '',
    });
  };

  const onSubmit = (data: AttendeeFormValues) => {
    console.log('최종 데이터:', data);
  };

  return (
    <div>
      <h1>참석자 관리</h1>

      {/* 참석자 개별 입력 폼 */}
      <div>
        <label>
          이름:
          <input
            type="text"
            value={newAttendee.name}
            onChange={(e) =>
              setNewAttendee({ ...newAttendee, name: e.target.value })
            }
          />
        </label>

        <button type="button" onClick={handleAddAttendee}>
          참석자 추가
        </button>
      </div>

      {/* 추가된 참석자 리스트 */}
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <fieldset>
          <legend>참석자 목록</legend>
          {fields.map((field, index) => (
            <div key={field.id}>
              <p>이름: {field.name}</p>
              <button type="button" onClick={() => remove(index)}>
                삭제
              </button>
            </div>
          ))}
        </fieldset>
        <button type="submit">제출</button>
      </form>
    </div>
  );
};

export default MyForm;

// GOOGLE_OAUTH_ID=197944350252-4vtg8jmj1i7anftqqvabqjf1spdmr2e3.apps.googleusercontent.com
// GOOGLE_OAUTH_SECRET=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
// KAKAO_CLIENT_ID=f68ccfcdd29fe0b765d5d56f31cfc531
// KAKAO_CLIENT_SECRET=6uuRupNcOC3TA8kJZZw9hfuH69o2a9Mz
// NAVER_CLIENT_ID=_UfOQfMUUpGb9zEQxNsQ
// NAVER_CLIENT_SECRET=d7S38__i6D
// NEXT_PUBLIC_SANITY_PROJECT_ID="6dpgc0ey"
// NEXT_PUBLIC_SANITY_DATASET="production"
// NEXTAUTH_URL=http://localhost:3000
// NEXTAUTH_SECRET=7c0d5a309f546bdb3adc8154472de2834ee0f8bb67df851eca9184bd94e0f915
// # SANITY_PROJECT_ID=6dpgc0ey
// # SANITY_DATASET=production
// SANITY_SECRET_TOKEN=sk54liONJPjM37QmHGM9u1biqO1c5kfeUJEva8GaWWqL9AFovRQWFr801X6fZNGB9vnmH2OdVUCX8EZU7Z3L5z0zyZyY7GkDcAkXG6w9XQsLOxIw8pFhZY0UujcOrjafky5GoqTOr9At6xaYOK7MNh6KY1fVYOQQPIlV5kF5qMxvZuRiuNoJ
// # AIzaSyBB0aAG_fR7vnGdxzzIPKIYi_HX7sbSxl4
