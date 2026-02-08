'use client';

import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

const SIGNIN_PATH = '/auth/signin';

export default function LevelGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname() ?? '';

  if (status === 'loading') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-gray-500">로딩 중...</div>
      </div>
    );
  }

  const level = session?.user?.level ?? 0;
  const isSigninPage = pathname.startsWith(SIGNIN_PATH);

  if (session && level === 0 && !isSigninPage) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4">
        <p className="text-center text-lg text-gray-700">
          레벨이 0인 사용자는 서비스를 이용할 수 없습니다.
          <br />
          관리자에게 문의해 주세요.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => signOut({ callbackUrl: SIGNIN_PATH })}
        >
          로그아웃
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
