"use client";

import React, { useState, useCallback, useEffect } from "react";
import styles from "./player.module.css";
import { Album, Track } from "./lib/types";
import { useAudioPlayer } from "./hooks/useAudioPlayer";
import { useLyrics } from "./hooks/useLyrics";
import { Sidebar } from "./components/Sidebar";
import { AlbumGrid } from "./components/AlbumGrid";
import { AlbumDetailView } from "./components/AlbumDetailView";
import { PlayerView } from "./components/PlayerView";
import { PlayerBar } from "./components/PlayerBar";
import { DriveFilePicker } from "./components/DriveFilePicker";
import { SunIcon, MoonIcon } from "./lib/icons";

export default function MusicPlayerPage() {
    // UI State
    const [theme, setTheme] = useState<"dark" | "light">("dark");
    const [currentView, setCurrentView] = useState<"albums" | "player" | "albumDetail">("albums");
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Track State
    const [currentAlbum, setCurrentAlbum] = useState<Album | null>(null);
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);

    // View Switching
    const [viewMode, setViewMode] = useState<'disk' | 'lyrics'>('disk');

    // Drive Picker
    const [drivePickerOpen, setDrivePickerOpen] = useState(false);

    // Audio Hook
    const {
        audioRef, isPlaying, progress, duration,
        playTrack: audioPlay, togglePlay, seek,
        startDrag, stopDrag, updateDragProgress
    } = useAudioPlayer();

    // Lyrics Hook
    const { lyrics, currentLyricIndex } = useLyrics(currentTrack?.lrc, progress);

    // Handlers
    const handlePlayTrack = useCallback((album: Album, track: Track) => {
        if (currentTrack?.id !== track.id) {
            setCurrentAlbum(album);
            setCurrentTrack(track);
            audioPlay(track);
        } else {
            if (!isPlaying) togglePlay();
        }
        setCurrentView('player');
    }, [currentTrack, isPlaying, audioPlay, togglePlay]);

    const handleOpenAlbum = (album: Album) => {
        setCurrentAlbum(album);
        setCurrentView('albumDetail');
    };

    const handleBackToAlbums = () => {
        setCurrentView('albums');
    };

    const handleNext = useCallback(() => {
        if (!currentAlbum || !currentTrack) return;
        const index = currentAlbum.tracks.findIndex(t => t.id === currentTrack.id);
        if (index >= 0 && index < currentAlbum.tracks.length - 1) {
            handlePlayTrack(currentAlbum, currentAlbum.tracks[index + 1]);
        }
    }, [currentAlbum, currentTrack, handlePlayTrack]);

    const handlePrev = useCallback(() => {
        if (!currentAlbum || !currentTrack) return;
        const index = currentAlbum.tracks.findIndex(t => t.id === currentTrack.id);
        if (index > 0) {
            handlePlayTrack(currentAlbum, currentAlbum.tracks[index - 1]);
        }
    }, [currentAlbum, currentTrack, handlePlayTrack]);

    // Auto-play next track
    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.addEventListener('ended', handleNext);
            return () => audio.removeEventListener('ended', handleNext);
        }
    }, [handleNext, audioRef]);

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    const toggleViewMode = () => setViewMode(prev => prev === 'disk' ? 'lyrics' : 'disk');

    return (
        <div className={styles.container} data-theme={theme}>
            {/* Theme Toggle (Fixed Top Right) */}
            <button className={styles.themeToggle} onClick={toggleTheme}>
                {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>

            <div className={styles.mainLayout}>
                <Sidebar sidebarOpen={sidebarOpen} currentView={currentView} onViewChange={setCurrentView} onOpenDrivePicker={() => setDrivePickerOpen(true)} />
                <main className={styles.content}>
                    {currentView === 'albums' && (
                        <div className={styles.emptyLibrary}>
                            <div className={styles.emptyLibraryIcon}>🎵</div>
                            <h2>Your Library is Empty</h2>
                            <p>Connect Google Drive to play your audio files</p>
                            <button
                                className={styles.connectDriveButton}
                                onClick={() => setDrivePickerOpen(true)}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M7.71 3.5L1.15 15l4.29 7.5L12 13.5zM12.71 3.5L6.15 15l4.29 7.5h11.41l-4.29-7.5z" />
                                </svg>
                                Connect Google Drive
                            </button>
                        </div>
                    )}

                    {currentView === 'albumDetail' && currentAlbum && (
                        <AlbumDetailView
                            album={currentAlbum}
                            onPlayTrack={(track) => handlePlayTrack(currentAlbum, track)}
                            onBack={handleBackToAlbums}
                            currentTrackId={currentTrack?.id}
                        />
                    )}

                    {currentView === 'player' && (
                        <PlayerView
                            currentTrack={currentTrack} isPlaying={isPlaying} lyrics={lyrics}
                            currentLyricIndex={currentLyricIndex} viewMode={viewMode} onSeek={seek}
                        />
                    )}
                </main>

                <div className={styles.playlistSidebar}>
                    <h3>Playing Next</h3>
                    {currentAlbum ? currentAlbum.tracks.map(track => (
                        <div
                            key={track.id}
                            className={`${styles.playlistItem} ${currentTrack?.id === track.id ? styles.active : ''}`}
                            onClick={() => handlePlayTrack(currentAlbum, track)}
                        >
                            <div style={{ fontWeight: '500' }}>{track.title}</div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{track.artist}</div>
                        </div>
                    )) : <p style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Select an album to see tracks</p>}
                </div>
            </div>

            <PlayerBar
                currentTrack={currentTrack} isPlaying={isPlaying} progress={progress} duration={duration}
                togglePlay={togglePlay} startDrag={startDrag} stopDrag={stopDrag} updateDragProgress={updateDragProgress}
                playlistOpen={true} onTogglePlaylist={() => { }}
                viewMode={viewMode} onToggleView={toggleViewMode} onPrev={handlePrev} onNext={handleNext}
                onSwitchToPlayer={() => setCurrentView('player')}
            />

            {/* Google Drive File Picker Modal */}
            <DriveFilePicker
                isOpen={drivePickerOpen}
                onClose={() => setDrivePickerOpen(false)}
                onPlayTrack={handlePlayTrack}
            />
        </div>
    );
}
