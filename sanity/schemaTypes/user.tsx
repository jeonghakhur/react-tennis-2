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
      name: 'gender',
      type: 'string',
      title: '성별',
      options: {
        list: [
          { title: '남자', value: 'male' }, // title은 스튜디오에 표시될 값, value는 저장되는 값
          { title: '여자', value: 'female' },
        ],
        layout: 'radio', // 선택 옵션을 라디오 버튼으로 표시
      },
      initialValue: 'male', // 기본값 설정 (남자)
      validation: (Rule: any) =>
        Rule.required().error('성별을 선택해야 합니다.'),
    },
    {
      name: 'following',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'user' }],
        },
      ],
      validation: (Rule: any) => Rule.unique(),
    },
    {
      name: 'followers',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'user' }],
        },
      ],
      validation: (Rule: any) => Rule.unique(),
    },
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
