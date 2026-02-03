import { useState, useEffect, useRef } from 'react';

type LyricLine = { time: number; text: string };

export function useLyrics(trackLrc?: string, currentTime?: number) {
    const [lyrics, setLyrics] = useState<LyricLine[]>([]);
    const [currentLyricIndex, setCurrentLyricIndex] = useState(-1);
    const lyricsRef = useRef<LyricLine[]>([]);

    // Fetch and Parse Lyrics
    useEffect(() => {
        if (!trackLrc) {
            setLyrics([]);
            lyricsRef.current = [];
            return;
        }

        const fetchLyrics = async () => {
            try {
                const res = await fetch(trackLrc);
                const text = await res.text();
                const lines = text.split('\n');
                const parsed = lines.map(line => {
                    const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2})\](.*)/);
                    if (match) {
                        const min = parseInt(match[1]);
                        const sec = parseInt(match[2]);
                        const ms = parseInt(match[3]);
                        const time = min * 60 + sec + ms / 100;
                        return { time, text: match[4].trim() };
                    }
                    return null;
                }).filter(Boolean) as LyricLine[];
                setLyrics(parsed);
                lyricsRef.current = parsed;
            } catch (e) {
                console.error("Failed to load lyrics", e);
                setLyrics([]);
                lyricsRef.current = [];
            }
        };

        fetchLyrics();
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
