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
    { name: 'courtCount', type: 'string', title: 'CourtCount' },
    {
      name: 'courtNumbers',
      type: 'array',
      of: [
        {
          type: 'string',
        },
      ],
      title: 'CourtNumber',
    },
    // 필요한 필드 추가
  ],
  preview: {
    select: {
      authorName: 'author.name',
      authorUsername: 'author.username',
    },
    prepare(selection: any) {
      const { authorName, authorUsername, media } = selection;
      return {
        title: authorName,
        subtitle: `by ${authorName} (${authorUsername})`,
        media,
      };
    },
  },
};
