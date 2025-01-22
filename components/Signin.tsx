'use client';

import { ClientSafeProvider, signIn } from 'next-auth/react';

type Props = {
  providers: Record<string, ClientSafeProvider>;
  callbackUrl: string;
};

export default function SignIn({ providers, callbackUrl }: Props) {
  return (
    <>
      {Object.values(providers).map(({ name, id }) => (
        <button key={name} type="button" onClick={() => signIn(id, { callbackUrl })}>
          {`Sign in with ${name}`}
        </button>
      ))}
    </>
  );
}

