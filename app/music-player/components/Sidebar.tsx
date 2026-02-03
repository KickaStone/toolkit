import React from 'react';
import styles from '../player.module.css';


interface SidebarProps {
    sidebarOpen: boolean;
    currentView: string;
    onViewChange: (view: 'albums' | 'player') => void;
    onOpenDrivePicker?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, currentView, onViewChange, onOpenDrivePicker }) => {
    return (
        <aside className={`${styles.sidebar} ${!sidebarOpen ? styles.collapsed : ''}`}>
            <h2 style={{ marginBottom: '1rem', fontWeight: 'bold' }}>Library</h2>
            <div
                className={styles.playlistItem}
                onClick={() => onViewChange('albums')}
                style={{ fontWeight: currentView === 'albums' ? 'bold' : 'normal' }}
            >
                All Albums
            </div>

            <div style={{ marginTop: '1.5rem' }}>
                <h3 style={{ marginBottom: '0.5rem', fontSize: '0.875rem', opacity: 0.7 }}>Sources</h3>
                <div
                    className={styles.playlistItem}
                    onClick={onOpenDrivePicker}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7.71 3.5L1.15 15l4.29 7.5L12 13.5zM12.71 3.5L6.15 15l4.29 7.5h11.41l-4.29-7.5z" />
                    </svg>
                    Google Drive
                </div>
            </div>
        </aside>
    );
};
