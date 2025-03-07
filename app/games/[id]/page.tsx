'use client';

import { Container } from '@/components/Layout';
import LoadingGrid from '@/components/LoadingGrid';
import { use, useEffect, useState } from 'react';
import useGame from '@/hooks/useGames';

type Props = {
  params: Promise<{ id: string }>; // params가 Promise로 감싸져 있음
};

export default function Page({ params }: Props) {
  const { id } = use(params); // params를 비동기로 처리
  const { game, isLoading } = useGame(id);
  const [loading, setLoading] = useState<boolean>(isLoading);

  useEffect(() => {
    if (game) {
      console.log(game);
      setLoading(false);
    }
  }, [game]);

  return (
    <Container>
      {loading && <LoadingGrid loading={loading} />}
      {!game ? (
        <></>
      ) : (
        <div>
          <div>{game.courtName}</div>
        </div>
      )}
    </Container>
  );
}
