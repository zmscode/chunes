import { RepeatMode, ShuffleMode } from "@enums";
import { IPicture } from "music-metadata";

// === === === A === === ===

export interface Album {
	id: string;
	name: string;
	artist: string;
	artwork?: string;
	year?: number;
	trackCount: number;
	tracks: Track[];
}

export interface AppleMusicArtist {
	id: string;
	name: string;
	artwork?: {
		url: string;
		width: number;
		height: number;
	};
	genres?: string[];
}

export interface Artist {
	id: string;
	name: string;
	albums: Album[];
	image?: string;
}

export interface AudioContextValue {
	isInitialized: boolean;
	isLoading: boolean;
	error: string | null;
	currentTime: number;
	duration: number;
	volume: number;
	playbackRate: number;
	equalizerGains: number[];

	playTrack: (track: Track) => Promise<void>;
	play: () => Promise<void>;
	pause: () => void;
	stop: () => void;
	seek: (time: number) => void;
	setVolume: (volume: number, fade?: boolean) => void;
	setPlaybackRate: (rate: number) => void;
	setEqualizerGain: (band: number, gain: number) => void;
	resetEqualizer: () => void;
	applyEqualizerPreset: (
		preset: "flat" | "bass" | "vocal" | "treble"
	) => void;
	playNext: () => Promise<void>;
	playPrevious: () => Promise<void>;
	togglePlayPause: () => Promise<void>;
}

export interface AudioEngineConfig {
	crossfadeDuration?: number;
	preloadNext?: boolean;
	volumeFadeTime?: number;
	autoUnlock?: boolean;
}

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

export interface AudioQuality {
	bitrate?: number;
	sampleRate?: number;
	channels?: number;
	codec?: string;
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

// === === === B === === ===

// === === === C === === ===

export interface CrossfadeConfig {
	enabled: boolean;
	duration: number;
	curve: "linear" | "exponential" | "logarithmic";
}

// === === === D === === ===

export interface DirectoryHandle {
	kind: "directory";
	name: string;
	values(): AsyncIterableIterator<FileHandle | DirectoryHandle>;
}

// === === === E === === ===

export type EventListener<T extends keyof AudioEngineEvents> =
	AudioEngineEvents[T];

export interface EqualizerBand {
	frequency: number;
	gain: number;
	type: "lowshelf" | "highshelf" | "peaking";
}

export interface EqualizerPreset {
	name: string;
	gains: number[];
}

// === === === F === === ===

export interface FileHandle {
	kind: "file";
	name: string;
	getFile(): Promise<File>;
}

export interface FileMetadata {
	name: string;
	path: string;
	size: number;
	modified: Date;
	type: string;
}

// === === === G === === ===

// === === === H === === ===

export type Handle = FileHandle | DirectoryHandle;

// === === === I === === ===

// === === === J === === ===

// === === === K === === ===

// === === === L === === ===

export interface Language {
	key: string;
	nativeName: string;
	prefix: string;
}

export interface LibraryState {
	tracks: Map<string, Track>;
	albums: Map<string, Album>;
	artists: Map<string, Artist>;
	playlists: Map<string, Playlist>;
	isScanning: boolean;
	lastScanDate: Date | null;
}

export interface LyricLine {
	time: number;
	text: string;
	translation?: string;
}

// === === === M === === ===

export interface MusicWindow extends Window {
	showDirectoryPicker?: (options?: {
		mode: string;
	}) => Promise<DirectoryHandle>;
	__musicFolderHandle?: DirectoryHandle;
	__musicFiles?: Map<string, File>;
}

// === === === N === === ===

// === === === O === === ===

// === === === P === === ===

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

export interface ParsedLyrics {
	lines: LyricLine[];
	metadata: {
		title?: string;
		artist?: string;
		album?: string;
		offset?: number;
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

// === === === Q === === ===

// === === === R === === ===

// === === === S === === ===

export type SortableColumn = "title" | "artist" | "album" | "duration";

export type SortColumn = keyof Track;

export interface ScanCompleteData {
	processed: number;
	total: number;
}

export interface ScanCompleteEvent {
	processed: number;
	total: number;
}

export interface ScanErrorData {
	message: string;
}

export interface ScanErrorEvent {
	message: string;
}

export interface ScanFolderResult {
	success: boolean;
	count: number;
	total: number;
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

export interface ScanProgressEvent {
	type: "track";
	data: {
		filepath: string;
		metadata: ParsedMetadata;
	};
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

export interface SettingsState {
	musicFolder: string;
	theme: "system" | "dark" | "light";
	language: string;
	crossfadeDuration: number;
	equalizerPreset: string;
	showLyrics: boolean;
	scrobbleLastFm: boolean;
}

// === === === T === === ===

export type ThemeMode = "dark" | "light" | "system";

export interface ThemePreferences {
	system: ThemeMode;
	local: ThemeMode | null;
}

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
	isFavourite?: boolean;
}

// === === === U === === ===

// === === === V === === ===

export type ViewMode = "tracks" | "albums" | "artists";

// === === === W === === ===

// === === === X === === ===

// === === === Y === === ===

// === === === Z === === ===
