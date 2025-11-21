import { NextResponse } from 'next/server';

// Dev-only helper to emulate backend /auth/oauth-login endpoint.
// Accepts POST { provider, idToken, profile } and returns { accessToken, user }
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const idToken = body.idToken;

    // In dev, return a lightweight mocked access token and a small user stub.
    const accessToken = `dev-token-${Math.random().toString(36).slice(2)}`;
    const user = {
      dev: true,
      idTokenPreview: typeof idToken === 'string' ? idToken.slice(0, 8) : null,
      email: body.email || `dev+${Math.random().toString(36).slice(2)}@example.com`,
    };

    return NextResponse.json({ accessToken, user }, { status: 200 });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('oauth-login dev route error', err);
    return NextResponse.json({ message: 'dev oauth-login failed' }, { status: 500 });
  }
}
