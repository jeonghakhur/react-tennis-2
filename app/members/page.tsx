'use client';

import { Container } from '@/components/Layout';
import LoadingGrid from '@/components/LoadingGrid';
import { Button } from '@/components/ui/button';
import useAuthRedirect from '@/hooks/useAuthRedirect';
import { UserProps } from '@/model/user';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

export default function Page() {
  const { data: session } = useSession();
  const { isLoading } = useAuthRedirect('/', 4);

  const { data: membersData, mutate } = useSWR<
    UserProps[] | { error?: string }
  >('/api/members');
  const members = Array.isArray(membersData) ? membersData : [];

  const [loading, setLoading] = useState<boolean>(isLoading);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (membersData !== undefined) {
      setLoading(false);
    }
  }, [membersData]);

  const currentUserId = session?.user?.id;
  const isAdmin =
    typeof session?.user?.level === 'number' && session.user.level >= 4;

  async function handleDelete(member: UserProps) {
    if (!isAdmin || currentUserId === member.id) return;
    if (
      !confirm(
        `"${member.name}" 회원을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`
      )
    ) {
      return;
    }
    setDeletingId(member.id);
    try {
      const res = await fetch(`/api/members/${member.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || '삭제에 실패했습니다.');
        return;
      }
      mutate();
    } catch {
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Container className="px-5">
      {isLoading ? (
        <LoadingGrid loading={loading} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table whitespace-nowrap">
            <thead>
              <tr>
                <th>번호</th>
                <th>이름</th>
                <th>성별</th>
                <th>거주지</th>
                <th>출생년도</th>
                <th>레벨</th>
                {isAdmin && <th className="w-20">삭제</th>}
              </tr>
            </thead>
            <tbody>
              {members?.map((member, idx) => (
                <tr key={member.id}>
                  <td>{members.length - idx}</td>
                  <td>
                    <Link href={`/members/${member.id}`}>{member.name}</Link>
                  </td>
                  <td>{member.gender}</td>
                  <td>{member.address}</td>
                  <td>{member.birthyear}</td>
                  <td>{member.level}</td>
                  {isAdmin && (
                    <td>
                      {currentUserId !== member.id ? (
                        <Button
                          type="button"
                          variant="destructive"
                          size="xs"
                          disabled={deletingId === member.id}
                          onClick={() => handleDelete(member)}
                        >
                          {deletingId === member.id ? '삭제 중…' : '삭제'}
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          (본인)
                        </span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Container>
  );
}
