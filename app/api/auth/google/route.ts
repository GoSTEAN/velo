import { NextResponse } from 'next/server';

// Mirror for /api/auth/google — dev-only stub accepting { idToken }
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const idToken = body.idToken;

    const accessToken = `dev-token-${Math.random().toString(36).slice(2)}`;
    const user = {
      dev: true,
      idTokenPreview: typeof idToken === 'string' ? idToken.slice(0, 8) : null,
      email: body.email || `dev+${Math.random().toString(36).slice(2)}@example.com`,
    };

    return NextResponse.json({ accessToken, user }, { status: 200 });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('api auth/google dev route error', err);
    return NextResponse.json({ message: 'api auth/google failed' }, { status: 500 });
  }
}
