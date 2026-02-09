import { SearchUser, UserProps } from '@/model/user';
import { client } from '@/sanity/lib/client';

export async function existingUser(email: string) {
  return client.fetch(`*[_type == "user" && email == "${email}"][0]`);
}

export async function addUser({
  id,
  email,
  name,
  image,
  username,
  provider,
  level,
  gender,
  phone_number,
  birthday,
  birthyear,
}: UserProps) {
  return client.createIfNotExists({
    _id: id,
    _type: 'user',
    username,
    email,
    image,
    name,
    provider,
    level: level ?? 0,
    gender,
    phone_number,
    birthyear,
    birthday,
  });
}

export async function getAllMembers() {
  return client.fetch(
    `*[_type == "user"]{
      ...,
      "id": _id,
    }`
  );
}

export async function getUserByUser(id: string) {
  return client.fetch(
    `*[_type == "user" && _id == "${id}"]{
      ...,
      "id": _id,
    }[0]`
  );
}

export async function getUserByEmail(email: string) {
  return client.fetch(
    `*[_type == "user" && email == "${email}"]{
      ...,
      "id": _id,
    }[0]`
  );
}

export async function updateUserById(id: string, updatedData: UserProps) {
  return client
    .patch(id) // 수정할 유저의 `_id`
    .set(updatedData) // 변경할 데이터
    .commit(); // 변경 사항 저장
}

type RefDoc = {
  _id: string;
  _type: string;
  author?: { _ref?: string };
  attendees?: Array<{ author?: { _ref?: string }; [key: string]: unknown }>;
  comments?: Array<{ author?: { _ref?: string }; [key: string]: unknown }>;
  editHistory?: Array<{ author?: { _ref?: string }; [key: string]: unknown }>;
};

function stripAuthorRef<
  T extends { author?: { _ref?: string }; [key: string]: unknown },
>(userId: string, items: T[] | undefined): T[] | undefined {
  if (!items?.length) return undefined;
  let changed = false;
  const out = items.map((item) => {
    if (item.author?._ref === userId) {
      changed = true;
      const next = { ...item };
      delete next.author;
      return next as T;
    }
    return item;
  });
  return changed ? out : undefined;
}

/** 해당 user를 참조하는 모든 문서에서 참조를 제거한 뒤 user 삭제 (한 트랜잭션) */
export async function deleteUserById(userId: string) {
  const refs = await client.fetch<RefDoc[]>(
    `*[references($userId)]{ _id, _type, author, attendees, comments, editHistory }`,
    { userId }
  );

  const tx = client.transaction();

  for (const doc of refs) {
    if (doc._type === 'gameResult') {
      let patch = client.patch(doc._id);
      let hasChange = false;
      if (doc.author?._ref === userId) {
        patch = patch.unset(['author']);
        hasChange = true;
      }
      const fixedComments = stripAuthorRef(userId, doc.comments);
      if (fixedComments) {
        patch = patch.set({ comments: fixedComments });
        hasChange = true;
      }
      const fixedEditHistory = stripAuthorRef(userId, doc.editHistory);
      if (fixedEditHistory) {
        patch = patch.set({ editHistory: fixedEditHistory });
        hasChange = true;
      }
      if (hasChange) tx.patch(patch);
    } else if (doc._type === 'schedule') {
      let patch = client.patch(doc._id);
      let hasChange = false;
      if (doc.author?._ref === userId) {
        patch = patch.unset(['author']);
        hasChange = true;
      }
      const fixedAttendees = stripAuthorRef(userId, doc.attendees);
      if (fixedAttendees) {
        patch = patch.set({ attendees: fixedAttendees });
        hasChange = true;
      }
      const fixedComments = stripAuthorRef(userId, doc.comments);
      if (fixedComments) {
        patch = patch.set({ comments: fixedComments });
        hasChange = true;
      }
      if (hasChange) tx.patch(patch);
    }
  }

  tx.delete(userId);
  await tx.commit({ visibility: 'async' });
}

export async function searchUsers(keyword?: string) {
  const query = keyword
    ? `&& (name match "*${keyword}*") || (username match "*${keyword}*")`
    : '';
  return client
    .fetch(
      `
    *[_type == "user" ${query}]{
    "id": _id,
    image,
    "userName": username,
    }
    `
    )
    .then((users) =>
      users.map((user: SearchUser) => ({
        ...user,
        following: user.following ?? 0,
        followers: user.followers ?? 0,
      }))
    );
}

export async function getUserForProfile(id: string) {
  return client
    .fetch(
      `
    *[_type == "user" && _id == "${id}"][0]{
    "id": _id,
    image,
    name,
    "userName": username,
    "following": count(following),
    "followers": count(followers),
    "posts": count(*[_type == "post" && author->_id == "${id}"])
    }
    `
    )
    .then((user) => {
      if (!user) {
        return null;
      }
      return {
        ...user,
        following: user?.following ?? 0,
        followers: user?.followers ?? 0,
      };
    });
}

export async function addBookmark(userId: string, postId: string) {
  return client
    .patch(userId)
    .setIfMissing({ bookmarks: [] })
    .append('bookmarks', [
      {
        _ref: postId,
        _type: 'reference',
      },
    ])
    .commit({ autoGenerateArrayKeys: true });
}

export async function removeBookmark(userId: string, postId: string) {
  return client
    .patch(userId)
    .unset([`bookmarks[_ref=="${postId}"]`])
    .commit();
}
