import { SearchUser } from '@/model/user';
import { client } from '@/sanity/lib/client';

type OauthUser = {
  email: string;
  id: string;
  image?: string | null;
  name: string;
  username: string;
  provider: string | null;
  level: number;
  gender: string | null;
  phone_number: string | null;
  birthday: string | null;
  birthyear: string | null;
};

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
}: OauthUser) {
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
    following: [],
    followers: [],
  });
}

export async function getUserByUser(id: string) {
  return client.fetch(
    `*[_type == "user" && _id == "${id}"]{
      ...,
      "id": _id,
      following[]->{"id": _id, "userName": username, image},
      followers[]->{"userName": username, image},
      "bookmarks": bookmarks[]->_id
    }[0]`
  );
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
    "following": count(following),
    "followers": count(followers),
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
