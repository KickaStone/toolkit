import React, { useRef } from 'react';
import styles from '../player.module.css';
import { Track } from '../lib/types';
import { PlayIcon, PauseIcon, ListIcon, LyricsIcon, DiskIcon } from '../lib/icons';
import { formatTime } from '../lib/utils';

interface PlayerBarProps {
    currentTrack: Track | null;
    isPlaying: boolean;
    progress: number;
    duration: number;
    togglePlay: () => void;
    // Drag handlers hooks
    startDrag: () => void;
    stopDrag: (val: number) => void;
    updateDragProgress: (val: number) => void;

    // UI
    playlistOpen: boolean;
    onTogglePlaylist: () => void;

    // View Mode
    viewMode: 'disk' | 'lyrics';
    onToggleView: () => void;

    // Navigation
    onPrev: () => void;
    onNext: () => void;

    // View Switching
    onSwitchToPlayer: () => void;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({
    currentTrack,
    isPlaying,
    progress,
    duration,
    togglePlay,
    startDrag,
    stopDrag,
    updateDragProgress,
    playlistOpen,
    onTogglePlaylist,
    viewMode,
    onToggleView,
    onPrev,
    onNext,
    onSwitchToPlayer
}) => {
    const progressBarRef = useRef<HTMLDivElement>(null);

    const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!progressBarRef.current) return;

        startDrag();

        const calculateProgress = (clientX: number) => {
            if (!progressBarRef.current) return 0;
            const rect = progressBarRef.current.getBoundingClientRect();
            const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
            return pct * duration;
        };

        // Initial update
        updateDragProgress(calculateProgress(e.clientX));

        const handleMouseMove = (mm: MouseEvent) => {
            updateDragProgress(calculateProgress(mm.clientX));
        };

        const handleMouseUp = (mu: MouseEvent) => {
            const finalTime = calculateProgress(mu.clientX);
            stopDrag(finalTime);

            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const isTitleLong = (currentTrack?.title?.length || 0) > 20;

    return (
        <div className={styles.playerBar}>
            <div
                className={styles.progressBar}
                ref={progressBarRef}
                onMouseDown={handleProgressMouseDown}
            >
                <div
                    className={styles.progressFill}
                    style={{ width: `${(progress / (duration || 1)) * 100}%` }}
                />
            </div>

            <div className={styles.trackInfo}>
                <div
                    className={styles.miniArt}
                    onClick={onSwitchToPlayer}
                    style={{ cursor: 'pointer' }}
                    title="Switch to Player View"
                >
                    {currentTrack?.title.charAt(0) || "-"}
                </div>
                <div style={{ overflow: 'hidden', flex: 1 }}>
                    {/* Title with Marquee Check */}
                    {isTitleLong ? (
                        <div className={styles.marqueeContainer}>
                            <div className={styles.marqueeText} style={{ fontWeight: 'bold' }}>
                                {currentTrack?.title || "No Track"}
                            </div>
                        </div>
                    ) : (
                        <div style={{ fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {currentTrack?.title || "No Track"}
                        </div>
                    )}

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {currentTrack?.artist || "Unknown"}
                    </div>
                </div>
            </div>

            {/* Time Display */}
            <div style={{
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                fontVariantNumeric: 'tabular-nums',
                marginRight: '1rem',
                minWidth: '80px',
                textAlign: 'center'
            }}>
                {formatTime(progress)} / {formatTime(duration)}
            </div>

            <div className={styles.controls}>
                <button className={styles.controlBtn} onClick={onPrev} title="Previous">
                    {/* Prev */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
                </button>

                <button className={styles.playBtn} onClick={togglePlay}>
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </button>

                <button className={styles.controlBtn} onClick={onNext} title="Next">
                    {/* Next */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
                </button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', width: '250px', justifyContent: 'flex-end' }}>
                <button
                    className={styles.controlBtn}
                    onClick={onToggleView}
                    title={viewMode === 'disk' ? "Show Lyrics" : "Show Disk"}
                    style={{ color: viewMode === 'lyrics' ? 'var(--highlight-color)' : 'inherit' }}
                >
                    {viewMode === 'disk' ? <LyricsIcon /> : <DiskIcon />}
                </button>

                <button
                    className={styles.controlBtn}
                    onClick={onTogglePlaylist}
                    style={{ color: playlistOpen ? 'var(--highlight-color)' : 'inherit' }}
                >
                    <ListIcon />
                </button>
            </div>
        </div>
    );
};
