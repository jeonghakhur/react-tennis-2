'use client';
import useSWR from 'swr';
import { useCacheKeys } from '@/context/CacheKeysContext';
import { GetScheduleType } from '@/model/schedule';
import { Container } from '@/components/Layout';
import Link from 'next/link';

export default function Home() {
  const cacheKeys = useCacheKeys();

  const { data: scheduleData, isLoading } = useSWR<GetScheduleType[]>(
    cacheKeys.scheduleKey,
    {
      onSuccess: (data) => {
        return data.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      },
    }
  );

  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  return (
    <Container>
      {isLoading && <div>Loading...</div>}
      <ul>
        {scheduleData?.map(({ id, date, courtName }, index) => {
          const newDate = new Date(date);
          const formattedDate = newDate.toLocaleDateString('ko-KR', options);
          return (
            <li key={index}>
              <Link
                href={`/schedule/${id}`}
                className="flex items-center border my-3 rounded-xl py-3 px-4 gap-2"
              >
                <div>{formattedDate}</div>
                <div className="text-xs text-gray-500">|</div>
                <div>{courtName}</div>
              </Link>
            </li>
          );
        })}
      </ul>
    </Container>
  );
}
