import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
        return NextResponse.redirect(
            new URL('/music-player?auth_error=' + error, process.env.NEXTAUTH_URL!)
        );
    }

    if (!code) {
        return NextResponse.redirect(
            new URL('/music-player?auth_error=no_code', process.env.NEXTAUTH_URL!)
        );
    }

    try {
        // Exchange code for tokens
        const tokenResponse = await fetch(TOKEN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID!,
                client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/google/callback`,
                grant_type: 'authorization_code',
            }),
        });

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.text();
            console.error('Token exchange failed:', errorData);
            return NextResponse.redirect(
                new URL('/music-player?auth_error=token_exchange_failed', process.env.NEXTAUTH_URL!)
            );
        }

        const tokens = await tokenResponse.json();

        // Fetch user info
        const userResponse = await fetch(USERINFO_URL, {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });

        const userInfo = userResponse.ok ? await userResponse.json() : null;

        // Store tokens in HTTP-only cookie
        const sessionData = {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt: Date.now() + tokens.expires_in * 1000,
            user: userInfo ? {
                id: userInfo.id,
                name: userInfo.name,
                email: userInfo.email,
                picture: userInfo.picture,
            } : null,
        };

        const cookieStore = await cookies();
        cookieStore.set('google_session', JSON.stringify(sessionData), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return NextResponse.redirect(
            new URL('/music-player?auth_success=true', process.env.NEXTAUTH_URL!)
        );
    } catch (error) {
        console.error('OAuth callback error:', error);
        return NextResponse.redirect(
            new URL('/music-player?auth_error=callback_failed', process.env.NEXTAUTH_URL!)
        );
    }
}
