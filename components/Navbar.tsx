'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function NavBar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isSignin =
    pathname?.includes('/auth/signin') ||
    pathname?.includes('/studio/structure');

  const user = session?.user;
  const level = user?.level || 0;

  return (
    <div className="mb-3 px-5 py-3">
      {status !== 'loading' && (
        <div className="flex items-center">
          <ul className="flex gap-x-2">
            <li>
              <Link href="/">홈</Link>
            </li>
            {level > 0 && (
              <li>
                <Link href="/schedule">일정등록</Link>
              </li>
            )}
            {level > 2 && (
              <li>
                <Link href="/members">회원</Link>
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
