import type {
	PlatformService,
	FileMetadata,
	ParsedMetadata,
} from "./PlatformService";
import type { ScanResult, Track } from "@types";
import { v4 as uuidv4 } from "uuid";

declare global {
	interface Window {
		musicAPI: {
			selectFolder: () => Promise<string | null>;
			scanFolder: (path: string) => Promise<any>;
			readMetadata: (path: string) => Promise<ParsedMetadata>;
			getFile: (path: string) => Promise<ArrayBuffer>;
			checkFile: (path: string) => Promise<boolean>;
			getFileUrl: (path: string) => Promise<string>;
			onScanProgress: (
				callback: (event: any, data: any) => void
			) => () => void;
			onScanComplete: (
				callback: (event: any, data: any) => void
			) => () => void;
			onScanError: (
				callback: (event: any, error: any) => void
			) => () => void;
		};
	}
}

export class ElectronPlatform implements PlatformService {
	isElectron = true;
	platform: "electron" | "web" = "electron";
	private fileUrls = new Map<string, string>();

	async selectFolder(): Promise<string | null> {
		return window.musicAPI.selectFolder();
	}

	async *scanMusicFolder(folderPath: string): AsyncGenerator<ScanResult> {
		const tracks: Track[] = [];
		let resolver: ((value: void) => void) | null = null;
		let rejecter: ((error: Error) => void) | null = null;

		const completionPromise = new Promise<void>((resolve, reject) => {
			resolver = resolve;
			rejecter = reject;
		});

		const removeProgressListener = window.musicAPI.onScanProgress(
			(event, data) => {
				if (data.type === "track" && data.data) {
					const { filepath, metadata } = data.data;

					const track: Track = {
						id: uuidv4(),
						title:
							metadata.title ||
							this.getFilenameWithoutExtension(filepath),
						artist: metadata.artist || "Unknown Artist",
						album: metadata.album || "Unknown Album",
						albumArtist: metadata.albumArtist,
						duration: metadata.duration || 0,
						filepath,
						genre: metadata.genre,
						year: metadata.year,
						trackNumber: metadata.trackNumber,
						diskNumber: metadata.diskNumber,
						playCount: 0,
						dateAdded: new Date(),
						lrcPath: filepath.replace(
							/\.(m4a|mp3|flac|wav|aac|ogg)$/i,
							".lrc"
						),
					};

					if (metadata.picture) {
						const picture = metadata.picture;
						track.artwork = `data:${picture.format};base64,${Buffer.from(picture.data).toString("base64")}`;
					}

					tracks.push(track);
				}
			}
		);

		const removeCompleteListener = window.musicAPI.onScanComplete(
			(event, data) => {
				if (resolver) resolver();
			}
		);

		const removeErrorListener = window.musicAPI.onScanError(
			(event, error) => {
				if (rejecter) rejecter(new Error(error.message));
			}
		);

		window.musicAPI.scanFolder(folderPath).catch((error) => {
			if (rejecter) rejecter(error);
		});

		try {
			let lastYieldedCount = 0;
			const checkInterval = setInterval(() => {
				if (tracks.length > lastYieldedCount) {
					lastYieldedCount = tracks.length;
				}
			}, 100);

			await completionPromise;
			clearInterval(checkInterval);

			for (const track of tracks) {
				yield {
					type: "track",
					track,
				};
			}
		} finally {
			removeProgressListener();
			removeCompleteListener();
			removeErrorListener();
		}
	}

	async readFile(filepath: string): Promise<ArrayBuffer> {
		return window.musicAPI.getFile(filepath);
	}

	async writeFile(filepath: string, data: ArrayBuffer): Promise<void> {
		throw new Error("Write file not implemented");
	}

	async getFileMetadata(filepath: string): Promise<FileMetadata> {
		const metadata = await window.musicAPI.readMetadata(filepath);
		return {
			name: this.getFilenameWithoutExtension(filepath),
			path: filepath,
			size: 0,
			modified: new Date(),
			type: "audio",
		};
	}

	async fileExists(filepath: string): Promise<boolean> {
		return window.musicAPI.checkFile(filepath);
	}

	async getAudioFileUrl(filepath: string): Promise<string> {
		const url = await window.musicAPI.getFileUrl(filepath);
		this.fileUrls.set(filepath, url);
		return url;
	}

	releaseAudioUrl(url: string): void {
		for (const [path, storedUrl] of this.fileUrls.entries()) {
			if (storedUrl === url) {
				this.fileUrls.delete(path);
				break;
			}
		}
	}

	private getFilenameWithoutExtension(filepath: string): string {
		const parts = filepath.split(/[/\\]/);
		const filename = parts[parts.length - 1];
		return filename.replace(/\.(m4a|mp3|flac|wav|aac|ogg)$/i, "");
	}
}
