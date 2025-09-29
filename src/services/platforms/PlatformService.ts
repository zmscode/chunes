import type { ScanResult } from "@types";

export interface FileMetadata {
	name: string;
	path: string;
	size: number;
	modified: Date;
	type: string;
}

export interface ScanProgress {
	current: number;
	total: number;
	currentFile?: string;
}

export interface PlatformService {
	selectFolder(): Promise<string | null>;
	scanMusicFolder(path: string): AsyncGenerator<ScanResult>;
	readFile(path: string): Promise<ArrayBuffer>;
	writeFile(path: string, data: ArrayBuffer): Promise<void>;
	getFileMetadata(path: string): Promise<FileMetadata>;
	fileExists(path: string): Promise<boolean>;

	isElectron: boolean;
	platform: "electron" | "web";

	getAudioFileUrl(path: string): Promise<string>;
	releaseAudioUrl(url: string): void;
}

export interface ParsedMetadata {
	title?: string;
	artist?: string;
	album?: string;
	albumArtist?: string;
	duration?: number;
	genre?: string[];
	year?: number;
	trackNumber?: number;
	diskNumber?: number;
	picture?: {
		format: string;
		data: Buffer;
	}[];
}
