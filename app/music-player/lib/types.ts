export type Track = {
    id: string;
    title: string;
    artist: string;
    src: string;
    lrc?: string;
    duration?: string;
    source?: 'local' | 'drive';
};

export type Album = {
    id: string;
    title: string;
    artist: string;
    cover?: string;
    year?: string;
    tracks: Track[];
};
