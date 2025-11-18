import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body || {};

    // Very small dev-only stub: accept any non-empty email/password
    if (!email || !password) {
      return NextResponse.json({ message: 'Missing credentials' }, { status: 400 });
    }

    // Return a fake token and user object for local development
    const response = {
      accessToken: 'dev-access-token',
      user: {
        id: 'dev-user-1',
        email,
        name: 'Developer',
      },
    };

    return NextResponse.json(response);
  } catch (err) {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }
}
