import { useState, useEffect, useRef } from 'react';

type LyricLine = { time: number; text: string };

export function useLyrics(trackLrc?: string, currentTime?: number) {
    const [lyrics, setLyrics] = useState<LyricLine[]>([]);
    const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);
    const lyricsRef = useRef<LyricLine[]>([]);

    // Parse and Set Lyrics
    useEffect(() => {
        if (!trackLrc) {
            setLyrics([]);
            lyricsRef.current = [];
            return;
        }

        const parseLyrics = (text: string) => {
            const lines = text.split('\n');
            const parsed = lines.map(line => {
                // Match [mm:ss.xx] or [mm:ss.xxx]
                const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
                if (match) {
                    const min = parseInt(match[1]);
                    const sec = parseInt(match[2]);
                    const msStr = match[3];
                    const ms = parseInt(msStr);
                    // Handle both 2-digit and 3-digit ms
                    const time = min * 60 + sec + ms / (msStr.length === 3 ? 1000 : 100);
                    
                    let text = match[4].trim();
                    // Handle URL encoded text
                    try {
                        if (text.includes('%')) {
                            text = decodeURIComponent(text);
                        }
                    } catch (e) {
                        // Ignore decode errors
                    }
                    
                    return { time, text };
                }
                return null;
            }).filter(Boolean) as LyricLine[];
            setLyrics(parsed);
            lyricsRef.current = parsed;
        };

        if (trackLrc.trim().startsWith('[')) {
            parseLyrics(trackLrc);
        } else {
            const fetchLyrics = async () => {
                try {
                    const res = await fetch(trackLrc);
                    if (res.ok) {
                        const text = await res.text();
                        parseLyrics(text);
                    }
                } catch (e) {
                    console.error("Failed to load lyrics", e);
                    setLyrics([]);
                    lyricsRef.current = [];
                }
            };
            fetchLyrics();
        }
    }, [trackLrc]);

    // Sync Index
    useEffect(() => {
        if (currentTime === undefined) return;
        const currentLyrics = lyricsRef.current;
        if (currentLyrics.length > 0) {
            let idx = currentLyrics.findIndex((l) => l.time > currentTime) - 1;
            if (idx === -2) idx = currentLyrics.length - 1; // After last
            if (idx < 0) idx = -1; // Before first
            setCurrentLyricIndex(idx);
        }
    }, [currentTime]);

    return { lyrics, currentLyricIndex };
}
