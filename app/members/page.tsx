'use client';

import LoadingGrid from '@/components/LoadingGrid';
import { UserProps } from '@/model/user';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

export default function Page() {
  const { data: members, isLoading } = useSWR<UserProps[]>('/api/members');
  const [loading, setLoading] = useState<boolean>(isLoading);
  useEffect(() => {
    if (members) {
      setLoading(false);
    }
  }, [members]);

  function formatGender(gender: string) {
    return gender === 'male' ? '남성' : '여성';
  }

  return (
    <div className="px-5">
      <LoadingGrid loading={loading} />
      {!isLoading && (
        <table className="w-full table">
          <thead>
            <tr>
              <th>번호</th>
              <th>이름</th>
              <th>성별</th>
              <th>거주지</th>
              <th>출생년도</th>
              <th>레벨</th>
            </tr>
          </thead>
          <tbody>
            {members?.map((member, idx) => (
              <tr key={member.id}>
                <td>{members.length - idx}</td>
                <td>
                  <Link href={`/members/${member.id}`}>{member.name}</Link>
                </td>
                <td>{formatGender(member.gender)}</td>
                <td>{member.address}</td>
                <td>{member.birthyear}</td>
                <td>{member.level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
