import React from 'react';
import styles from '../player.module.css';
import { Album, Track } from '../lib/types';
import { PlayIcon } from '../lib/icons';

interface AlbumDetailViewProps {
    album: Album;
    onPlayTrack: (track: Track) => void;
    onBack: () => void;
    currentTrackId?: string;
}

export const AlbumDetailView: React.FC<AlbumDetailViewProps> = ({
    album,
    onPlayTrack,
    onBack,
    currentTrackId
}) => {
    return (
        <div className={styles.albumDetailView}>
            <button className={styles.backBtn} onClick={onBack}>
                &larr; Back to Library
            </button>

            <div className={styles.albumHeader}>
                <div className={styles.largeAlbumArt}>
                    {album.title.charAt(0)}
                </div>
                <div className={styles.albumInfoText}>
                    <h1 className={styles.albumTitle}>{album.title}</h1>
                    <p className={styles.albumArtist}>{album.artist}</p>
                    <div className={styles.albumActions}>
                        <button
                            className={styles.headerPlayBtn}
                            onClick={() => onPlayTrack(album.tracks[0])}
                        >
                            <PlayIcon /> Play
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.trackListContainer}>
                <div className={styles.trackListHeader}>
                    <span className={styles.trackIndex}>#</span>
                    <span className={styles.trackTitle}>Song</span>
                    <span className={styles.trackArtist}>Artist</span>
                    <span className={styles.trackTime}>Time</span>
                </div>
                {album.tracks.map((track, index) => (
                    <div
                        key={track.id}
                        className={`${styles.trackRow} ${currentTrackId === track.id ? styles.activeTrack : ''}`}
                        onClick={() => onPlayTrack(track)}
                    >
                        <span className={styles.trackIndex}>{index + 1}</span>
                        <div className={styles.trackTitleGroup}>
                            <span className={styles.trackName}>{track.title}</span>
                        </div>
                        <span className={styles.trackArtist}>{track.artist}</span>
                        <span className={styles.trackTime}>--:--</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
