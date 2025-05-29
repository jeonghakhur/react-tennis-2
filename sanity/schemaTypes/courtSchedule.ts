import React from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */
export const courtSchedule = {
  name: 'schedule',
  type: 'document',
  title: 'Schedule',
  fields: [
    { name: 'author', type: 'reference', to: [{ type: 'user' }] },
    { name: 'date', type: 'string', title: 'Date' },
    { name: 'startTime', type: 'string', title: 'StartTime' },
    { name: 'endTime', type: 'string', title: 'EndTime' },
    { name: 'courtName', type: 'string', title: 'CourtName' },
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      description: '스케줄의 현재 상태',
      options: {
        list: [
          { title: '대기중', value: 'pending' },
          { title: '참석자 저장 완료', value: 'attendees_done' },
          { title: '대진표 작성 완료', value: 'match_done' },
          { title: '게임 결과 등록 완료', value: 'game_done' },
        ],
        layout: 'dropdown',
      },
    },
    {
      name: 'courtNumbers',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'attendees',
      type: 'array',
      of: [
        {
          name: 'attendee',
          type: 'document',
          fields: [
            {
              name: 'author',
              type: 'reference',
              to: [{ type: 'user' }],
            },
            { name: 'name', type: 'string' },
            { name: 'startHour', type: 'string' },
            { name: 'startMinute', type: 'string' },
            { name: 'endHour', type: 'string' },
            { name: 'endMinute', type: 'string' },
            { name: 'gender', type: 'string' },
            // { name: 'membership', type: 'boolean', },
          ],
        },
      ],
    },
    {
      name: 'comments',
      type: 'array',
      of: [
        {
          name: 'comment',
          type: 'document',
          fields: [
            {
              name: 'author',
              type: 'reference',
              to: [{ type: 'user' }],
            },
            {
              name: 'text',
              type: 'string',
            },
          ],
        },
      ],
    },
  ],
  preview: {
    select: {
      courtName: 'courtName',
      date: 'date',
      authorName: 'author.name',
      authorUsername: 'author.username',
      media: 'author.image',
      // attendees: 'attendees',
    },
    prepare({ courtName, date, authorName, authorUsername, media }: any) {
      return {
        title: `${courtName} ${new Date(date).toLocaleDateString('ko-KR')}`,
        subtitle: `by ${authorName} (${authorUsername})`,
        media: media
          ? React.createElement('img', { src: media, alt: '' })
          : null,
      };
    },
  },
};
