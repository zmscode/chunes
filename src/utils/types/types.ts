import { RepeatMode, ShuffleMode } from "@utils/types/enums";
import type { IPicture } from "music-metadata";

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

export interface FileMetadata {
	name: string;
	path: string;
	size: number;
	modified: Date;
	type: string;
}

export interface ScanResult {
	type: "track" | "progress";
	track?: Track;
	progress?: {
		current: number;
		total: number;
		currentFile?: string;
	};
}

export interface PlatformService {
	readonly isElectron: boolean;
	readonly platform: "electron" | "web";

	selectFolder(): Promise<string | null>;

	scanMusicFolder(path: string): AsyncGenerator<ScanResult>;

	readFile(path: string): Promise<ArrayBuffer>;
	writeFile(path: string, data: ArrayBuffer): Promise<void>;
	getFileMetadata(path: string): Promise<FileMetadata>;
	fileExists(path: string): Promise<boolean>;

	getAudioFileUrl(filepath: string): Promise<string>;
	releaseAudioUrl(url: string): void;
}

export interface ParsedMetadata {
	title: string | null;
	artist: string | null;
	artists?: string[];
	album: string | null;
	albumArtist: string | null;
	duration: number;
	genre?: string[];
	year: number | null;
	trackNumber: number | null;
	diskNumber: number | null;
	picture: Array<{
		format: string;
		data: Buffer | Uint8Array;
	}> | null;
}

export interface ScanProgressData {
	type: "track" | "progress";
	data?: {
		filepath: string;
		metadata: ParsedMetadata;
	};
	progress?: {
		current: number;
		total: number;
		currentFile?: string;
	};
}

export interface ScanCompleteData {
	processed: number;
	total: number;
}

export interface ScanErrorData {
	message: string;
}

export interface DirectoryHandle {
	kind: "directory";
	name: string;
	values(): AsyncIterableIterator<FileHandle | DirectoryHandle>;
}

export interface FileHandle {
	kind: "file";
	name: string;
	getFile(): Promise<File>;
}

export type Handle = FileHandle | DirectoryHandle;

export interface AudioEngineEvents {
	play: () => void;
	pause: () => void;
	ended: () => void;
	stopped: () => void;
	seeked: () => void;
	timeupdate: (time: number) => void;
	durationchange: (duration: number) => void;
	error: (error: Error) => void;
	loadstart: () => void;
	loadeddata: () => void;
	volumechange: (volume: number) => void;
	initialized: () => void;
	unlocked: () => void;
	crossfaded: () => void;
}

export type EventListener<T extends keyof AudioEngineEvents> =
	AudioEngineEvents[T];

export interface AudioMetadata {
	title?: string;
	artist?: string;
	artists?: string[];
	album?: string;
	albumArtist?: string;
	genre?: string[];
	year?: number;
	trackNumber?: number;
	diskNumber?: number;
	duration?: number;
	picture?: IPicture[];
}

export interface AudioState {
	isPlaying: boolean;
	currentTime: number;
	duration: number;
	volume: number;
	playbackRate: number;
	isMuted: boolean;
	isLooping: boolean;
	isShuffling: boolean;
}

export interface EqualizerPreset {
	name: string;
	gains: number[];
}

export interface AudioVisualizerConfig {
	fftSize: 2048 | 4096 | 8192;
	smoothingTimeConstant: number;
	minDecibels: number;
	maxDecibels: number;
}

export interface CrossfadeConfig {
	enabled: boolean;
	duration: number;
	curve: "linear" | "exponential" | "logarithmic";
}

export interface AudioQuality {
	bitrate?: number;
	sampleRate?: number;
	channels?: number;
	codec?: string;
}

export type { IAudioMetadata, IPicture } from "music-metadata";
