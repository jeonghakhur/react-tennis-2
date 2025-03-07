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

export async function updateGameResult(id: string, games: any[]) {
  return client
    .patch(id)
    .set({ games })
    .commit({ autoGenerateArrayKeys: true });
}

export async function getAllGames() {
  return client.fetch(
    `*[_type == "gameResult"] {
      ...,
      "scheduleId": schedule->_id,
      "date": schedule->date,
      "author": user->name,
      "courtName": schedule->courtName,
    }`
  );
}

export async function getGame(scheduleId: string) {
  return client.fetch(
    `*[_type == "gameResult" && schedule._ref == "${scheduleId}"][0] {
      ...,
      "date": schedule->date,
      "courtName": schedule->courtName,
      "startTime": schedule->startTime,
      "endTime": schedule->endTime,
    }`
  );
}
