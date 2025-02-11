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
    level,
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
