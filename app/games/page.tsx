'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React from 'react';

export default function Home() {
  return (
    <div className="p-5">
      <ul className="flex flex-col gap-y-2 ">
        <li>
          <div className="card">
            <p>
              <Link href="/games/1">2021.01.11(수요일)</Link>망원한강코트
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="ml-auto"
            >
              참석투표
            </Button>
            {/* <ChevronRight size={18} color="grey" className="arrow" /> */}
          </div>
        </li>
        <li>
          <div className="card">
            <p>
              <Link href="/games/1">2021.01.11(수요일)</Link>망원한강코트
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="ml-auto"
            >
              결과보기
            </Button>
            {/* <ChevronRight size={18} color="grey" className="arrow" /> */}
          </div>
        </li>
      </ul>
    </div>
  );
}
