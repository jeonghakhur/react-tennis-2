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
    `*[_type == "gameResult"] | order(schedule->date desc) {
      ...,
      "scheduleID": schedule->_id,
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
      "scheduleID": schedule->_id,
      "date": schedule->date,
      "courtName": schedule->courtName,
      "startTime": schedule->startTime,
      "endTime": schedule->endTime,
      "scheduleStatus": schedule->status,
    }`
  );
}

export async function getGameById(gameId: string) {
  return client.fetch(
    `*[_type == "gameResult" && _id == "${gameId}"][0] {
      ...,
      "scheduleID": schedule->_id,
      "date": schedule->date,
      "courtName": schedule->courtName,
      "startTime": schedule->startTime,
      "endTime": schedule->endTime,
      "scheduleStatus": schedule->status,
    }`
  );
}

export async function hasGameResult(scheduleId: string) {
  const result = await client.fetch(
    `*[_type == "gameResult" && schedule._ref == "${scheduleId}"][0] {
      _id
    }`
  );
  return !!result;
}

export async function getGameIdByScheduleId(scheduleId: string) {
  const result = await client.fetch(
    `*[_type == "gameResult" && schedule._ref == "${scheduleId}"][0] {
      _id
    }`
  );
  return result?._id;
}

export async function deleteGame(id: string) {
  try {
    await client.transaction().delete(id).commit({ visibility: 'async' });
    console.log('게임 데이터가 삭제되었습니다');
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ Error deleting schedule ${id}:`, error);
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Unknown error' };
  }
}
