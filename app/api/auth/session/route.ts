import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('google_session');

    if (!sessionCookie) {
        return NextResponse.json({ authenticated: false });
    }

    try {
        const session = JSON.parse(sessionCookie.value);

        // Check if token is expired
        if (session.expiresAt < Date.now()) {
            // Token expired, try to refresh
            if (session.refreshToken) {
                const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        refresh_token: session.refreshToken,
                        client_id: process.env.GOOGLE_CLIENT_ID!,
                        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                        grant_type: 'refresh_token',
                    }),
                });

                if (refreshResponse.ok) {
                    const tokens = await refreshResponse.json();
                    session.accessToken = tokens.access_token;
                    session.expiresAt = Date.now() + tokens.expires_in * 1000;

                    cookieStore.set('google_session', JSON.stringify(session), {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'lax',
                        maxAge: 60 * 60 * 24 * 7,
                        path: '/',
                    });
                } else {
                    // Refresh failed, clear session
                    cookieStore.delete('google_session');
                    return NextResponse.json({ authenticated: false });
                }
            } else {
                cookieStore.delete('google_session');
                return NextResponse.json({ authenticated: false });
            }
        }

        return NextResponse.json({
            authenticated: true,
            user: session.user,
        });
    } catch {
        return NextResponse.json({ authenticated: false });
    }
}

export async function DELETE() {
    const cookieStore = await cookies();
    cookieStore.delete('google_session');
    return NextResponse.json({ success: true });
}
