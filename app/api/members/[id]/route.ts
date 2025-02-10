import { getUserByUser } from '@/service/user';
import { withSessionUser } from '@/util/session';

import { NextRequest, NextResponse } from 'next/server';

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_: NextRequest, context: Context) {
  const { id } = await context.params;

  return withSessionUser(async () =>
    getUserByUser(id).then((data) => NextResponse.json(data))
  );
}
