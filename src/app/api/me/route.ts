import { NextResponse } from 'next/server';
import { getSession, getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    const user = getSessionUser(session);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
