'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import React, { useState, useEffect, useCallback } from 'react';

export default function Home() {
  return (
    <div className="p-5">
      <ul>
        <li>
          <div className="card">
            <Link href="/games/1">2021.01.11(수요일)</Link>
            <p>망원한강코트</p>
            <ChevronRight size={18} color="grey" className="arrow" />
          </div>
        </li>
      </ul>
    </div>
  );
}

