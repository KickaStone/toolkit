import { useState, useRef, useEffect, useCallback } from 'react';
import { Track } from '../lib/types';

export function useAudioPlayer(onEnded?: () => void) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
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

    const playTrack = useCallback((track: Track) => {
        if (audioRef.current) {
            audioRef.current.src = track.src;
            audioRef.current.load();
            audioRef.current.play()
                .then(() => setIsPlaying(true))
                .catch(e => console.error("Playback failed", e));
        }
    }, []);

    const togglePlay = useCallback(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
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
        playTrack,
        togglePlay,
        seek,
        startDrag,
        stopDrag,
        updateDragProgress
    };
}
