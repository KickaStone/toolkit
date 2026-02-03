// Google Drive API client utilities

export interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    isFolder: boolean;
    size: number | null;
    modifiedTime?: string;
    thumbnailLink?: string;
}

export interface DriveUser {
    id: string;
    name: string;
    email: string;
    picture?: string;
}

export interface AuthStatus {
    authenticated: boolean;
    user?: DriveUser;
}

export async function getAuthStatus(): Promise<AuthStatus> {
    try {
        const response = await fetch('/api/auth/session');
        return await response.json();
    } catch {
        return { authenticated: false };
    }
}

export function signIn(): void {
    window.location.href = '/api/auth/google';
}

export async function signOut(): Promise<void> {
    await fetch('/api/auth/session', { method: 'DELETE' });
    window.location.reload();
}

export async function listDriveFiles(folderId?: string): Promise<{ files: DriveFile[]; folderId: string }> {
    const url = new URL('/api/drive/files', window.location.origin);
    if (folderId) {
        url.searchParams.set('folderId', folderId);
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
        const error = await response.json();
        if (error.needsReauth) {
            signIn();
        }
        throw new Error(error.error || 'Failed to list files');
    }

    return response.json();
}

export function getDriveStreamUrl(fileId: string): string {
    return `/api/drive/stream/${fileId}`;
}

// Helper to extract file extension from name
export function getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
}

// Check if a file is an audio file based on MIME type
export function isAudioFile(mimeType: string): boolean {
    return mimeType.startsWith('audio/');
}
