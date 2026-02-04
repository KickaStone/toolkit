import { useState, useRef, useEffect, useCallback } from 'react';
import { Track } from '../lib/types';

export function useAudioPlayer(onEnded?: () => void) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [lyrics, setLyrics] = useState<string | undefined>(undefined);
    const isDraggingRef = useRef(false);
    const onEndedRef = useRef(onEnded);

    useEffect(() => {
        onEndedRef.current = onEnded;
    }, [onEnded]);

    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
        }

        const audio = audioRef.current;

        const handleTimeUpdate = () => {
            if (!isDraggingRef.current) {
                setProgress(audio.currentTime);
            }
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0);
            if (onEndedRef.current) onEndedRef.current();
        };

        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("loadedmetadata", handleLoadedMetadata);
        audio.addEventListener("ended", handleEnded);

        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
            audio.removeEventListener("ended", handleEnded);
            audio.pause();
        };
    }, []);

    const playTrack = useCallback(async (track: Track) => {
        if (audioRef.current) {
            // Reset lyrics before potentially loading new ones
            setLyrics(track.lrc);

            // If we have an lrcSource (e.g. Google Drive ID), fetch its content
            if (track.lrcSource) {
                try {
                    const response = await fetch(`/api/drive/stream/${track.lrcSource}`);
                    if (response.ok) {
                        let lrcContent = await response.text();
                        // Handle potential URL encoding
                        try {
                            if (lrcContent.includes('%')) {
                                lrcContent = decodeURIComponent(lrcContent);
                            }
                        } catch (e) {
                            console.warn("Failed to decode lyrics as URI component", e);
                        }
                        setLyrics(lrcContent);
                    }
                } catch (error) {
                    console.error("Failed to fetch lyrics:", error);
                }
            }

            audioRef.current.src = track.src;
            audioRef.current.load();
            audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(e => {
                    if (e.name === 'AbortError') return;
                    console.error("Playback failed", e);
                });
        }
    }, []);

    const togglePlay = useCallback(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                audioRef.current.play()
                    .then(() => setIsPlaying(true))
                    .catch(e => {
                        if (e.name === 'AbortError') return;
                        console.error("Playback failed", e);
                    });
            }
        }
    }, [isPlaying]);

    const seek = useCallback((time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setProgress(time); // Immediate update
        }
    }, []);

    // Drag interactions
    const startDrag = useCallback(() => {
        isDraggingRef.current = true;
    }, []);

    const stopDrag = useCallback((finalTime?: number) => {
        isDraggingRef.current = false;
        if (finalTime !== undefined) {
            seek(finalTime);
        }
    }, [seek]);

    const updateDragProgress = useCallback((val: number) => {
        setProgress(val);
    }, []);

    return {
        audioRef,
        isPlaying,
        progress,
        duration,
        lyrics,
        playTrack,
        togglePlay,
        seek,
        startDrag,
        stopDrag,
        updateDragProgress
    };
}
