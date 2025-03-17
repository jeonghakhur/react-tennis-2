'use client';

import { Container } from '@/components/Layout';
import LoadingGrid from '@/components/LoadingGrid';
import { use, useEffect, useState } from 'react';
import useGame from '@/hooks/useGames';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

type Props = {
  params: Promise<{ id: string }>; // params가 Promise로 감싸져 있음
};

export default function Page({ params }: Props) {
  const { id } = use(params); // params를 비동기로 처리
  const { game, isLoading, removeGame } = useGame(id);
  const [loading, setLoading] = useState<boolean>(isLoading);
  const router = useRouter();

  useEffect(() => {
    if (game) {
      console.log(game);
      setLoading(false);
    }
  }, [game]);

  const handleDelete = function (id: string) {
    const isConfirmed = confirm('정말 삭제하시겠습니까?');
    if (isConfirmed) {
      setLoading(true);
      removeGame(id)
        .then((data) => console.log(data))
        .catch((error) => console.error(error))
        .finally(() => {
          setLoading(false);
          router.push('/games');
        });
    }
  };

  const handleUpdate = function (id: string) {
    console.log('update', id);
  };

  return (
    <Container>
      {loading && <LoadingGrid loading={loading} />}
      {!game ? (
        <></>
      ) : (
        <div>
          <div>{game.courtName}</div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="destructive"
              size="lg"
              className="flex-1"
              onClick={() => handleDelete(game._id!)}
            >
              삭제
            </Button>
            <Button
              type="button"
              size="lg"
              className="flex-1"
              onClick={() => handleUpdate(game._id!)}
            >
              수정
            </Button>
          </div>
        </div>
      )}
    </Container>
  );
}
