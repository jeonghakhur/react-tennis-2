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
      status: 'wait',
    },
    { autoGenerateArrayKeys: true }
  );
}

export async function updateGameResult(
  id: string,
  games: any[],
  status?: string,
  editor?: any,
  scheduleId?: string
) {
  const now = new Date().toISOString();
  const authorRef = editor?._ref || editor;
  const editRecord = {
    author: { _ref: authorRef, _type: 'reference' },
    createdAt: now,
  };
  console.log(status, scheduleId);
  if (status && scheduleId) {
    return client
      .transaction()
      .patch(id, { set: { games } })
      .patch(scheduleId, { set: { status } })
      .commit({ autoGenerateArrayKeys: true });
  } else {
    return client
      .patch(id)
      .set({ games })
      .append('editHistory', [editRecord])
      .commit({ autoGenerateArrayKeys: true });
  }
}

export async function getAllGames(status?: string | null) {
  const statusFilter = status ? `&& schedule->status == "${status}"` : '';

  return client.fetch(
    `*[_type == "gameResult"${statusFilter}] | order(schedule->date desc) {
      ...,
      "scheduleID": schedule->_id,
      "date": schedule->date,
      "author": {"name": author->name,},
      "courtName": schedule->courtName,
      "comments": comments[]{
        ...,
        "author": {
          "_ref": author._ref,
          "name": author->name,
          "username": author->username,
          "image": author->image
        },
        "createdAt": createdAt
      }
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
      "status": schedule->status,
      "comments": comments[]{
        ...,
        "author": {
          "_ref": author._ref,
          "name": author->name,
          "username": author->username,
          "image": author->image
        },
        "createdAt": createdAt
      }
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
      "status": status,
      "comments": comments[]{
        ...,
        "author": {
          "_ref": author._ref,
          "name": author->name,
          "username": author->username,
          "image": author->image
        },
        "createdAt": createdAt
      }
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

export async function addCommentToGameResult(
  gameResultId: string,
  comment: any
) {
  return client
    .patch(gameResultId)
    .setIfMissing({ comments: [] })
    .append('comments', [comment])
    .commit({ autoGenerateArrayKeys: true });
}

export async function removeCommentFromGameResult(
  gameResultId: string,
  commentKey: string
) {
  return client
    .patch(gameResultId)
    .unset([`comments[_key=="${commentKey}"]`])
    .commit();
}

/**
 * status 값을 인수로 받아 최신 게임 결과를 가져오는 함수
 */
export async function getLatestGameByStatus(status?: string | null) {
  const statusFilter = status ? `&& schedule->status == "${status}"` : '';
  return client.fetch(
    `*[_type == "gameResult"${statusFilter}] | order(schedule->date desc)[0] {
      ...,
      "scheduleID": schedule->_id,
      "date": schedule->date,
      "courtName": schedule->courtName,
      "startTime": schedule->startTime,
      "endTime": schedule->endTime,
      "scheduleStatus": schedule->status,
      "comments": comments[]{
        ...,
        "author": {
          "_ref": author._ref,
          "name": author->name,
          "username": author->username,
          "image": author->image
        },
        "createdAt": createdAt
      }
    }`
  );
}
