import { type ReactNode } from "react";
import { Album, Artist, Track } from "@types";

// === === === A === === ===

export interface AlbumGridProps {
	albums: Album[];
	onAlbumClick: (album: Album) => void;
	onAlbumPlay: (album: Album) => void;
	allTracks?: Track[];
	onAllTracksClick?: () => void;
	onAllTracksPlay?: () => void;
}

export interface ArtistViewProps {
	artist: Artist;
	onPlayAll: (tracks: Track[]) => void;
	onShuffleAll: (tracks: Track[]) => void;
	onAlbumClick: (album: Album) => void;
	onTrackClick: (track: Track) => void;
}

export interface AudioProviderProps {
	children: ReactNode;
}

// === === === B === === ===

// === === === C === === ===

// === === === D === === ===

export interface DragWindowRegionProps {
	title?: ReactNode;
}

// === === === E === === ===

// === === === F === === ===

// === === === G === === ===

// === === === H === === ===

// === === === I === === ===

// === === === J === === ===

// === === === K === === ===

// === === === L === === ===

export interface LibraryScannerProps {
	onScanComplete?: (trackCount: number) => void;
}

export interface LyricsPanelProps {
	onClose?: () => void;
	className?: string;
}

// === === === M === === ===

// === === === N === === ===

// === === === O === === ===

// === === === P === === ===

export interface PlayerLayoutProps {
	children: ReactNode;
}

// === === === Q === === ===

export interface QueuePanelProps {
	trigger?: ReactNode;
	onSaveAsPlaylist?: (tracks: Track[]) => void;
}

export interface QueueTrackItemProps {
	track: Track;
	index: number;
	isPlaying: boolean;
	isCurrent: boolean;
	onClick: () => void;
	onRemove: () => void;
}

// === === === R === === ===

// === === === S === === ===

// === === === T === === ===

export interface TrackListProps {
	tracks: Track[];
	currentTrackId: string | null;
	isPlaying: boolean;
	onTrackPlay: (track: Track) => void;
	onTrackPause: () => void;
	sortBy?: keyof Track;
	sortOrder?: "asc" | "desc";
	onSortChange?: (column: keyof Track) => void;
}

// === === === U === === ===

// === === === V === === ===

// === === === W === === ===

// === === === X === === ===

// === === === Y === === ===

// === === === Z === === ===
