/* eslint-disable @typescript-eslint/no-explicit-any */

import Image from 'next/image';

export const user = {
  name: 'user',
  type: 'document',
  fields: [
    {
      name: 'username',
      type: 'string',
    },
    {
      name: 'name',
      type: 'string',
    },
    {
      name: 'provider',
      type: 'string',
    },
    {
      name: 'email',
      type: 'string',
    },
    {
      name: 'image',
      type: 'string',
    },
    {
      name: 'level',
      type: 'number',
      initialValue: 0,
    },
    {
      name: 'birthyear',
      type: 'string',
      title: '출생년도',
    },
    {
      name: 'birthday',
      type: 'string',
      title: '생일',
    },
    {
      name: 'phone_number',
      type: 'string',
      title: '핸드폰번호',
    },
    {
      name: 'address',
      type: 'string',
      title: '거주지',
    },
    {
      name: 'gender',
      type: 'string',
      title: '성별',
    },
    // {
    //   name: 'following',
    //   type: 'array',
    //   of: [
    //     {
    //       type: 'reference',
    //       to: [{ type: 'user' }],
    //     },
    //   ],
    //   validation: (Rule: any) => Rule.unique(),
    // },
    // {
    //   name: 'followers',
    //   type: 'array',
    //   of: [
    //     {
    //       type: 'reference',
    //       to: [{ type: 'user' }],
    //     },
    //   ],
    //   validation: (Rule: any) => Rule.unique(),
    // },
    // {
    //   name: 'bookmarks',
    //   type: 'array',
    //   of: [
    //     {
    //       type: 'reference',
    //       to: [{ type: 'post' }],
    //     },
    //   ],
    //   validation: (Rule: any) => Rule.unique(),
    // },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'username',
      media: 'image',
    },
    prepare({ title, subtitle, media }: any) {
      return {
        title,
        subtitle,
        media: media ? <Image src={media} alt="" width={20} height={20} /> : '',
      };
    },
  },
};
