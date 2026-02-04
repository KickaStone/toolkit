import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3/files';

// Audio file MIME types we support
const AUDIO_MIME_TYPES = [
    'audio/mpeg',        // mp3
    'audio/mp3',
    'audio/wav',
    'audio/x-wav',
    'audio/flac',
    'audio/x-flac',
    'audio/ogg',
    'audio/aac',
    'audio/mp4',         // m4a
    'audio/x-m4a',
];

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const folderId = searchParams.get('folderId') || 'root';
    const audioOnly = searchParams.get('audioOnly') !== 'false';

    // Build query: get folders, audio files, and lyric files (.lrc) in the specified folder
    const mimeQuery = audioOnly
        ? `(mimeType='application/vnd.google-apps.folder' or ${AUDIO_MIME_TYPES.map(m => `mimeType='${m}'`).join(' or ')} or name contains '.lrc')`
        : '';

    const query = [
        `'${folderId}' in parents`,
        'trashed=false',
        mimeQuery,
    ].filter(Boolean).join(' and ');

    try {
        const url = new URL(DRIVE_API_URL);
        url.searchParams.set('q', query);
        url.searchParams.set('fields', 'files(id,name,mimeType,size,modifiedTime,webContentLink,thumbnailLink)');
        url.searchParams.set('orderBy', 'folder,name');
        url.searchParams.set('pageSize', '100');

        const response = await fetch(url.toString(), {
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                return NextResponse.json(
                    { error: 'Token expired', needsReauth: true },
                    { status: 401 }
                );
            }
            throw new Error(`Drive API error: ${response.status}`);
        }

        const data = await response.json();

        // Map files to a cleaner format
        const files = data.files.map((file: {
            id: string;
            name: string;
            mimeType: string;
            size?: string;
            modifiedTime?: string;
            thumbnailLink?: string;
        }) => ({
            id: file.id,
            name: file.name,
            mimeType: file.mimeType,
            isFolder: file.mimeType === 'application/vnd.google-apps.folder',
            size: file.size ? parseInt(file.size) : null,
            modifiedTime: file.modifiedTime,
            thumbnailLink: file.thumbnailLink,
        }));

        return NextResponse.json({ files, folderId });
    } catch (error) {
        console.error('Drive list error:', error);
        return NextResponse.json(
            { error: 'Failed to list files' },
            { status: 500 }
        );
    }
}
