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
    }),
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
            onChange={(e) => setNewAttendee({ ...newAttendee, name: e.target.value })}
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

