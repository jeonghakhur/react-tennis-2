'use client';

import useAuthRedirect from '@/hooks/useAuthRedirect';
import { Container } from '@/components/Layout';
import LoadingGrid from '@/components/LoadingGrid';
import { useEffect, useState } from 'react';

export default function Page() {
  const { isLoading } = useAuthRedirect('/', 0);
  const [loading, setLoading] = useState<boolean>(isLoading);

  useEffect(() => {
    setLoading(true);
  }, []);

  return (
    <Container>
      {isLoading ? <LoadingGrid loading={loading} /> : <div>Games</div>}
    </Container>
  );
}
