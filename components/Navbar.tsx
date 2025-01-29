'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function NavBar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isSignin =
    pathname?.includes('/auth/signin') ||
    pathname?.includes('/studio/structure');

  return (
    <div className="mb-3 px-5">
      {status !== 'loading' && (
        <div className="flex items-center">
          <ul className="flex gap-x-2">
            <li>
              <Link href="/">홈</Link>
            </li>
            <li>
              <Link href="/schedule">일정등록</Link>
            </li>
          </ul>
          {!isSignin && (
            <div className="ml-auto">
              {session ? (
                <Button type="button" variant="link" onClick={() => signOut()}>
                  로그아웃
                </Button>
              ) : (
                <Button type="button" variant="link" onClick={() => signIn()}>
                  로그인
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
