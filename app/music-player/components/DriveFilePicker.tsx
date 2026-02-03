import React, { useState, useEffect, useCallback } from 'react';
import styles from '../player.module.css';
import {
    DriveFile,
    DriveUser,
    getAuthStatus,
    signIn,
    signOut,
    listDriveFiles,
    getDriveStreamUrl,
    isAudioFile,
} from '../lib/googleDrive';
import { Track, Album } from '../lib/types';

interface DriveFilePickerProps {
    isOpen: boolean;
    onClose: () => void;
    onPlayTrack: (album: Album, track: Track) => void;
}

interface BreadcrumbItem {
    id: string;
    name: string;
}

export const DriveFilePicker: React.FC<DriveFilePickerProps> = ({
    isOpen,
    onClose,
    onPlayTrack,
}) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<DriveUser | null>(null);
    const [files, setFiles] = useState<DriveFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
        { id: 'root', name: 'My Drive' },
    ]);

    const currentFolderId = breadcrumbs[breadcrumbs.length - 1].id;

    const checkAuth = useCallback(async () => {
        const status = await getAuthStatus();
        setIsAuthenticated(status.authenticated);
        setUser(status.user || null);
        setLoading(false);
    }, []);

    const loadFiles = useCallback(async (folderId: string) => {
        setLoading(true);
        setError(null);
        try {
            const result = await listDriveFiles(folderId);
            setFiles(result.files);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load files');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            checkAuth();
        }
    }, [isOpen, checkAuth]);

    useEffect(() => {
        if (isOpen && isAuthenticated) {
            loadFiles(currentFolderId);
        }
    }, [isOpen, isAuthenticated, currentFolderId, loadFiles]);

    const handleFolderClick = (folder: DriveFile) => {
        setBreadcrumbs(prev => [...prev, { id: folder.id, name: folder.name }]);
    };

    const handleBreadcrumbClick = (index: number) => {
        setBreadcrumbs(prev => prev.slice(0, index + 1));
    };

    const handleFileClick = (file: DriveFile) => {
        if (file.isFolder) {
            handleFolderClick(file);
        } else if (isAudioFile(file.mimeType)) {
            // Create a track and album for this file
            const track: Track = {
                id: `drive-${file.id}`,
                title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
                artist: 'Google Drive',
                src: getDriveStreamUrl(file.id),
                source: 'drive',
            };

            const album: Album = {
                id: `drive-folder-${currentFolderId}`,
                title: breadcrumbs[breadcrumbs.length - 1].name,
                artist: 'Google Drive',
                tracks: files
                    .filter(f => isAudioFile(f.mimeType))
                    .map(f => ({
                        id: `drive-${f.id}`,
                        title: f.name.replace(/\.[^/.]+$/, ''),
                        artist: 'Google Drive',
                        src: getDriveStreamUrl(f.id),
                        source: 'drive' as const,
                    })),
            };

            onPlayTrack(album, track);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.drivePickerModal} onClick={e => e.stopPropagation()}>
                <div className={styles.drivePickerHeader}>
                    <h2>Google Drive</h2>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>

                {!isAuthenticated ? (
                    <div className={styles.driveSignIn}>
                        <div className={styles.driveSignInIcon}>
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M7.71 3.5L1.15 15l4.29 7.5L12 13.5zM12.71 3.5L6.15 15l4.29 7.5h11.41l-4.29-7.5z" />
                                <path d="M8.29 16.5L6.15 20h11.41l2.14-3.5z" opacity="0.5" />
                            </svg>
                        </div>
                        <p>Sign in to access your audio files</p>
                        <button className={styles.signInButton} onClick={signIn}>
                            Sign in with Google
                        </button>
                    </div>
                ) : (
                    <>
                        <div className={styles.driveUserInfo}>
                            {user?.picture && (
                                <img src={user.picture} alt="" className={styles.userAvatar} />
                            )}
                            <span>{user?.email}</span>
                            <button className={styles.signOutButton} onClick={signOut}>
                                Sign out
                            </button>
                        </div>

                        <div className={styles.breadcrumbs}>
                            {breadcrumbs.map((crumb, index) => (
                                <React.Fragment key={crumb.id}>
                                    {index > 0 && <span className={styles.breadcrumbSeparator}>/</span>}
                                    <button
                                        className={styles.breadcrumbItem}
                                        onClick={() => handleBreadcrumbClick(index)}
                                    >
                                        {crumb.name}
                                    </button>
                                </React.Fragment>
                            ))}
                        </div>

                        <div className={styles.driveFileList}>
                            {loading ? (
                                <div className={styles.loadingState}>
                                    <div className={styles.spinner}></div>
                                    <p>Loading files...</p>
                                </div>
                            ) : error ? (
                                <div className={styles.errorState}>
                                    <p>{error}</p>
                                    <button onClick={() => loadFiles(currentFolderId)}>Retry</button>
                                </div>
                            ) : files.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <p>No audio files found in this folder</p>
                                </div>
                            ) : (
                                files.map(file => (
                                    <div
                                        key={file.id}
                                        className={styles.driveFileItem}
                                        onClick={() => handleFileClick(file)}
                                    >
                                        <span className={styles.fileIcon}>
                                            {file.isFolder ? '📁' : '🎵'}
                                        </span>
                                        <span className={styles.fileName}>{file.name}</span>
                                        {!file.isFolder && file.size && (
                                            <span className={styles.fileSize}>
                                                {formatFileSize(file.size)}
                                            </span>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
