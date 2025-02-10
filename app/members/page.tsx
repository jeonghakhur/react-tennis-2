'use client';

import { UserProps } from '@/model/user';
import Link from 'next/link';
import { useEffect } from 'react';
import useSWR from 'swr';

export default function Page() {
  const { data: members, isLoading } = useSWR<UserProps[]>('/api/members');
  useEffect(() => {
    console.log(members);
  }, [members]);

  return (
    <div>
      {!isLoading && (
        <div>
          {members?.map((member) => (
            <div key={member.id}>
              <Link href={`/api/members/${member.id}`}>{member.username}</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
