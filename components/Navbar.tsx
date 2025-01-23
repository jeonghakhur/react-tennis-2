'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from './ui/button';
export default function NavBar() {
  const { data: session } = useSession();
  console.log(session);
  return (
    <div className="flex">
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
    </div>
  );
}
