import React, { useState, useRef, useEffect } from 'react';
import styles from '../player.module.css';
import { Track } from '../lib/types';

interface PlayerViewProps {
    currentTrack: Track | null;
    isPlaying: boolean;
    lyrics: { time: number; text: string }[];
    currentLyricIndex: number;
    viewMode: 'disk' | 'lyrics';
    onSeek: (time: number) => void;
}

export const PlayerView: React.FC<PlayerViewProps> = ({
    currentTrack,
    isPlaying,
    lyrics,
    currentLyricIndex,
    viewMode,
    onSeek
}) => {
    const fullLyricsContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll full lyrics
    useEffect(() => {
        if (viewMode === 'lyrics' && currentLyricIndex >= 0 && fullLyricsContainerRef.current) {
            const el = document.getElementById(`lyric-line-${currentLyricIndex}`);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [currentLyricIndex, viewMode]);

    return (
        <div
            className={styles.playerView}
        >
            <div
                className={styles.sliderContainer}
                style={{
                    transform: `translateX(${viewMode === 'disk' ? '0%' : '-50%'})`
                }}
            >
                {/* Page 1: Disk & Simple Lyrics */}
                <div className={styles.slidePage}>
                    <div style={{ position: 'relative' }}>
                        {/* Tonearm UI */}
                        <div className={`${styles.tonearm} ${isPlaying ? styles.playing : ''}`}>
                            <div className={styles.tonearmBody}>
                                <div className={styles.tonearmHead}></div>
                            </div>
                        </div>

                        <div className={`${styles.diskContainer} ${isPlaying ? styles.playing : ''}`}>
                            <div className={styles.diskArt}>
                                {currentTrack?.title ? currentTrack.title.substring(0, 2).toUpperCase() : "LP"}
                            </div>
                        </div>
                    </div>

                    {/* Simple 3-line lyrics snippet */}
                    <div className={styles.simpleLyrics}>
                        {lyrics.length > 0 ? (
                            lyrics.slice(Math.max(0, currentLyricIndex - 1), currentLyricIndex + 2).map((l, i) => (
                                <div
                                    key={i}
                                    className={`${styles.lyricsLine} ${l.text === (lyrics[currentLyricIndex]?.text || '') ? styles.active : ''}`}
                                    style={{ margin: '0.2rem 0', opacity: l.text === (lyrics[currentLyricIndex]?.text || '') ? 1 : 0.6 }}
                                >
                                    {l.text}
                                </div>
                            ))
                        ) : (
                            <div className={styles.lyricsLine}>No Lyrics Available</div>
                        )}
                    </div>
                </div>

                {/* Page 2: Full Lyrics */}
                <div className={styles.slidePage}>
                    <div className={styles.fullLyricsContainer} ref={fullLyricsContainerRef}>
                        {lyrics.length > 0 ? (
                            lyrics.map((l, i) => (
                                <div
                                    key={i}
                                    id={`lyric-line-${i}`}
                                    className={`${styles.fullLyricsLine} ${i === currentLyricIndex ? styles.active : ''}`}
                                    onClick={() => onSeek(l.time)}
                                >
                                    {l.text}
                                </div>
                            ))
                        ) : (
                            <p style={{ marginTop: '2rem' }}>No lyrics available for this track.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
