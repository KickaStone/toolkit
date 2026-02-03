import React from 'react';
import styles from '../player.module.css';
import { Album } from '../lib/types';

interface AlbumGridProps {
    albums: Album[];
    onPlayAlbum: (album: Album) => void;
}

export const AlbumGrid: React.FC<AlbumGridProps> = ({ albums, onPlayAlbum }) => {
    return (
        <div className={styles.albumGrid}>
            {albums.map(album => (
                <div key={album.id} className={styles.albumCard} onClick={() => onPlayAlbum(album)}>
                    <div className={styles.albumArtPlaceholder}>
                        {album.title.substring(0, 1)}
                    </div>
                    <h3>{album.title}</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {album.artist}
                    </p>
                </div>
            ))}
        </div>
    );
};
