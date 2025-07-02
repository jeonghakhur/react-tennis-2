'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function NavBar() {
  const { data: session, status } = useSession();
  const pathname = usePathname() || '';
  const isSignin =
    pathname?.includes('/auth/signin') ||
    pathname?.includes('/studio/structure');

  const user = session?.user;
  const level = user?.level || 0;
  const [largeFont, setLargeFont] = useState<null | boolean>(null);

  // 마운트 후 localStorage에서 값 동기화
  useEffect(() => {
    const saved = localStorage.getItem('bigFont');
    if (saved === 'true') setLargeFont(true);
    else if (saved === 'false') setLargeFont(false);
    else setLargeFont(false);
  }, []);

  // 큰글씨 상태를 html에 반영하고 localStorage에 저장
  useEffect(() => {
    if (largeFont !== null) {
      const html = document.documentElement;
      if (largeFont) html.classList.add('big-font');
      else html.classList.remove('big-font');

      localStorage.setItem('bigFont', String(largeFont));
    }
  }, [largeFont]);

  return (
    <div className="header-wrapper mb-3 px-6 py-3">
      {status !== 'loading' && (
        <div className="flex items-center">
          <ul className="flex gap-x-3 text-lg font-bold">
            <li>
              <Link
                href="/"
                className={
                  'relative pb-0.5 ' +
                  (pathname === '/'
                    ? 'border-b-2 border-blue-600 transition-all duration-300 ease-in-out'
                    : 'border-b-2 border-transparent transition-all duration-300 ease-in-out')
                }
              >
                홈
              </Link>
            </li>
            {level > 0 && (
              <>
                <li>
                  <Link
                    href="/schedule"
                    className={
                      'relative pb-0.5 ' +
                      (pathname.startsWith('/schedule')
                        ? 'border-b-2 border-blue-600 transition-all duration-300 ease-in-out'
                        : 'border-b-2 border-transparent transition-all duration-300 ease-in-out')
                    }
                  >
                    일정
                  </Link>
                </li>
                <li>
                  <Link
                    href="/games"
                    className={
                      'relative pb-0.5 ' +
                      (pathname.startsWith('/games')
                        ? 'border-b-2 border-blue-600 transition-all duration-300 ease-in-out'
                        : 'border-b-2 border-transparent transition-all duration-300 ease-in-out')
                    }
                  >
                    게임
                  </Link>
                </li>
              </>
            )}
            {level > 4 && (
              <li>
                <Link
                  href="/members"
                  className={
                    'relative pb-0.5 ' +
                    (pathname.startsWith('/members')
                      ? 'border-b-2 border-blue-600 transition-all duration-300 ease-in-out'
                      : 'border-b-2 border-transparent transition-all duration-300 ease-in-out')
                  }
                >
                  회원
                </Link>
              </li>
            )}
          </ul>
          {!isSignin && (
            <div className="ml-auto">
              {user ? (
                <div className="flex items-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => signOut({ callbackUrl: '/' })}
                  >
                    로그아웃
                  </Button>
                  <Link href="/user">
                    <Image
                      src={user.image ?? '/default_profile.png'}
                      width={36}
                      height={36}
                      alt={`${user.name} profile image`}
                      className="rounded-full"
                      priority
                    />
                  </Link>
                </div>
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
