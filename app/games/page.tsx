'use client';
import { Container } from '@/components/Layout';
import LoadingGrid from '@/components/LoadingGrid';
import useAuthRedirect from '@/hooks/useAuthRedirect';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import useSWR from 'swr';

type GameProps = {
  _id: string;
  date: Date;
  courtName: string;
};

export default function Home() {
  const { isLoading } = useAuthRedirect('/', 0);
  const { data: games } = useSWR<GameProps[]>('/api/games');
  const [loading, setLoading] = useState<boolean>(isLoading);

  useEffect(() => {
    if (games) {
      console.log(games);
      setLoading(false);
    }
  }, [games]);

  return (
    <Container className="p-5">
      {isLoading ? (
        <LoadingGrid loading={loading} />
      ) : (
        <div>
          {games?.map((game) => {
            const date = new Date(game.date);
            console.log(date);
            return (
              <Link
                href={`/games/${game._id}`}
                key={game._id}
                className="block border rounded-[16px] px-5 py-4"
              >
                <div>{game.courtName}</div>
                <div>
                  {format(new Date(date), 'yyyy.MM.dd')}(
                  {format(new Date(date), 'EEE', { locale: ko })})
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </Container>
  );
}
