'use client';

import { use } from 'react';

type Props = {
  params: Promise<{ id: string }>; // params가 Promise로 감싸져 있음
};

export default function Members({ params }: Props) {
  const { id } = use(params); // params를 비동기로 처리

  return (
    <div>
      <div>members: {id}</div>
    </div>
  );
}
