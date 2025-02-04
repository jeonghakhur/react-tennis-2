import { addAttendees } from '@/service/schedule';
import { withSessionUser } from '@/util/session';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(req: NextRequest) {
  return withSessionUser(async (user) => {
    const {id, newAttendees} = await req.json();

    return addAttendees(user, id, newAttendees).then((data) => NextResponse.json(data));
  });
}
