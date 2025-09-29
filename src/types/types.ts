import { RepeatMode, ShuffleMode } from "@enums";

export type ThemeMode = "dark" | "light" | "system";

export interface Track {
	id: string;
	title: string;
	artist: string;
	album: string;
	albumArtist?: string;
	duration: number;
	filepath: string;
	artwork?: string;
	genre?: string[];
	year?: number;
	trackNumber?: number;
	diskNumber?: number;
	playCount: number;
	lastPlayed?: Date;
	dateAdded: Date;
	lrcPath?: string;
}

export interface Album {
	id: string;
	name: string;
	artist: string;
	artwork?: string;
	year?: number;
	trackCount: number;
	tracks: Track[];
}

export interface Artist {
	id: string;
	name: string;
	albums: Album[];
	image?: string;
}

export interface Playlist {
	id: string;
	name: string;
	description?: string;
	tracks: string[];
	createdAt: Date;
	updatedAt: Date;
	isSmartPlaylist?: boolean;
	rules?: PlaylistRule[];
}

export interface PlaylistRule {
	field: keyof Track;
	operator: "contains" | "equals" | "greaterThan" | "lessThan";
	value: any;
}

export interface PlaybackState {
	isPlaying: boolean;
	currentTrackId: string | null;
	currentTime: number;
	duration: number;
	volume: number;
	repeatMode: RepeatMode;
	shuffleMode: ShuffleMode;
	queue: string[];
	queueIndex: number;
	history: string[];
}

export interface LyricLine {
	time: number;
	text: string;
	translation?: string;
}

export interface LibraryState {
	tracks: Map<string, Track>;
	albums: Map<string, Album>;
	artists: Map<string, Artist>;
	playlists: Map<string, Playlist>;
	isScanning: boolean;
	lastScanDate: Date | null;
}

export interface SettingsState {
	musicFolder: string;
	theme: "system" | "dark" | "light";
	language: string;
	crossfadeDuration: number;
	equalizerPreset: string;
	showLyrics: boolean;
	showVisualizer: boolean;
	scrobbleLastFm: boolean;
}

export interface ScanResult {
	type: "track" | "progress";
	data?: {
		filepath: string;
		metadata: any;
	};
	progress?: {
		current: number;
		total: number;
	};
}
