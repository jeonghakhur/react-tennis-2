import SignIn from '@/components/Signin';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import { getProviders } from 'next-auth/react';
import { redirect } from 'next/navigation';

type Props = {
  searchParams: {
    callbackUrl: string;
  };
};

export default async function SignPage({ searchParams }: Props) {
  const callbackUrl = searchParams?.callbackUrl || '/';
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/');
  }

  const providers = (await getProviders()) ?? {};

  return (
    <section className="flex flex-col w-[300px] mt-10 mx-auto">
      <SignIn providers={providers} callbackUrl={callbackUrl} />
    </section>
  );
}
