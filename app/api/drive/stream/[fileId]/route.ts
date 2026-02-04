import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3/files';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ fileId: string }> }
) {
    const { fileId } = await params;
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('google_session');

    if (!sessionCookie) {
        return NextResponse.json(
            { error: 'Not authenticated' },
            { status: 401 }
        );
    }

    let session;
    try {
        session = JSON.parse(sessionCookie.value);
    } catch {
        return NextResponse.json(
            { error: 'Invalid session' },
            { status: 401 }
        );
    }

    try {
        // First, get file metadata to determine MIME type
        const metaResponse = await fetch(
            `${DRIVE_API_URL}/${fileId}?fields=mimeType,name,size`,
            {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
            }
        );

        if (!metaResponse.ok) {
            return NextResponse.json(
                { error: 'File not found' },
                { status: 404 }
            );
        }

        const metadata = await metaResponse.json();

        // Stream the file content
        const streamResponse = await fetch(
            `${DRIVE_API_URL}/${fileId}?alt=media`,
            {
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
            }
        );

        if (!streamResponse.ok) {
            return NextResponse.json(
                { error: 'Failed to stream file' },
                { status: streamResponse.status }
            );
        }

        // Return the stream with appropriate headers
        const headers = new Headers();
        headers.set('Content-Type', metadata.mimeType);
        // Encode filename for non-ASCII characters (RFC 5987)
        const encodedFilename = encodeURIComponent(metadata.name).replace(/['()]/g, escape);
        headers.set('Content-Disposition', `inline; filename*=UTF-8''${encodedFilename}`);
        if (metadata.size) {
            headers.set('Content-Length', metadata.size);
        }
        headers.set('Accept-Ranges', 'bytes');
        headers.set('Cache-Control', 'private, max-age=3600');

        return new NextResponse(streamResponse.body, {
            status: 200,
            headers,
        });
    } catch (error) {
        console.error('Stream error:', error);
        return NextResponse.json(
            { error: 'Failed to stream file' },
            { status: 500 }
        );
    }
}
