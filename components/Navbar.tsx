'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { usePathname } from 'next/navigation';

export default function NavBar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isSignin =
    pathname?.includes('/auth/signin') ||
    pathname?.includes('/studio/structure');

  return (
    <div>
      {status !== 'loading' && (
        <div className="flex">
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
