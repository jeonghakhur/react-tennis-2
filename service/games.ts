/* eslint-disable @typescript-eslint/no-explicit-any */
import { client } from '@/sanity/lib/client';

export async function createGameResult(
  scheduleId: string,
  userId: string,
  matches: any
) {
  console.log(scheduleId, matches);
  return client.create(
    {
      _type: 'gameResult',
      schedule: { _ref: scheduleId, _type: 'reference' },
      author: { _ref: userId, _type: 'reference' },
      games: [...matches],
    },
    { autoGenerateArrayKeys: true }
  );
}
