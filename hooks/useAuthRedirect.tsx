import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function useAuthRedirect(redirectTo: string = '/auth/signin') {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session && status !== 'loading') {
      router.push(redirectTo);
    }
  }, [session, status, router, redirectTo]);

  return { session, status };
}
