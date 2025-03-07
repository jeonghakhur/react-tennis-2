/* eslint-disable @typescript-eslint/no-explicit-any */

import { format } from 'date-fns';

export const gameResult = {
  name: 'gameResult',
  type: 'document',
  fields: [
    { name: 'schedule', type: 'reference', to: [{ type: 'schedule' }] },
    { name: 'author', type: 'reference', to: [{ type: 'user' }] },
    {
      name: 'games',
      title: 'Games',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'court',
              title: 'Court Number',
              type: 'number',
              description: '코트 번호',
            },
            {
              name: 'players',
              title: 'Players',
              type: 'array',
              of: [{ type: 'string' }],
              description: '참가하는 플레이어 이름 리스트',
            },
            {
              name: 'score',
              title: 'Score',
              type: 'array',
              of: [{ type: 'string' }],
              description: '경기 스코어 (팀별 점수)',
            },
            {
              name: 'time',
              title: 'Game Time',
              type: 'string',
              description: "경기 시작 시간 (예: '19:00')",
            },
          ],
        },
      ],
    },
  ],
  preview: {
    select: {
      title: 'schedule.date',
      subtitle: 'schedule.courtName',
    },
    prepare({ title, subtitle }: any) {
      return {
        title: format(new Date(title), 'yyyy.MM.dd'),
        subtitle,
      };
    },
  },
};
