'use client';

import { Container } from '@/components/Layout';
import LoadingGrid from '@/components/LoadingGrid';
import { GetScheduleProps } from '@/model/schedule';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import Link from 'next/link';
import { useEffect } from 'react';
import useSWR from 'swr';

export default function Home() {
  const { data: schedules, isLoading } =
    useSWR<GetScheduleProps[]>('/api/schedule');

  useEffect(() => {
    console.log(schedules);
  }, [schedules]);

  return (
    <Container>
      {isLoading ? (
        <LoadingGrid loading={isLoading} />
      ) : (
        <ul>
          {schedules?.map(
            (
              {
                id,
                date,
                startTime,
                endTime,
                courtNumbers,
                courtName,
                attendees,
                voting,
              },
              index
            ) => {
              const courtNumber = courtNumbers
                .map((item) => item.number)
                .join(', ');
              return (
                <li key={index}>
                  <Link
                    href={`/schedule/${id}`}
                    className="flex items-center justify-between border my-3 rounded-xl py-3 px-4 gap-2"
                  >
                    <div className="flex flex-col gap-y-1">
                      <div>
                        <span>
                          {format(new Date(date), 'yyyy.MM.dd')}(
                          {format(new Date(date), 'EEE', { locale: ko })})
                        </span>
                        <span className="ml-2">
                          {startTime} - {endTime}
                        </span>
                      </div>
                      <div>장소: {courtName}</div>
                      <div className="flex items-center">
                        <div>코트: {courtNumber}</div>
                        <div className="text-gray-500 mx-2 text-[14px]">|</div>
                        <div>참석자: {attendees.length}</div>
                      </div>
                    </div>
                    <div>{`${voting === true ? '진행' : '종료'}`}</div>
                  </Link>
                </li>
              );
            }
          )}
        </ul>
      )}
    </Container>
  );
}
