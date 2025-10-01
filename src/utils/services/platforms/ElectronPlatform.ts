import type { FileMetadata, ParsedMetadata, ScanResult, Track } from "@types";
import type { IpcRendererEvent } from "electron";
import { v4 as uuidv4 } from "uuid";

interface ScanFolderResult {
	success: boolean;
	count: number;
	total: number;
}

interface ScanProgressEvent {
	type: "track";
	data: {
		filepath: string;
		metadata: ParsedMetadata;
	};
}

interface ScanCompleteEvent {
	processed: number;
	total: number;
}

interface ScanErrorEvent {
	message: string;
}

declare global {
	interface Window {
		musicAPI: {
			selectFolder: () => Promise<string | null>;
			scanFolder: (path: string) => Promise<ScanFolderResult>;
			readMetadata: (path: string) => Promise<ParsedMetadata>;
			getFile: (path: string) => Promise<ArrayBuffer>;
			checkFile: (path: string) => Promise<boolean>;
			getFileUrl: (path: string) => Promise<string>;
			onScanProgress: (
				callback: (
					event: IpcRendererEvent,
					data: ScanProgressEvent
				) => void
			) => () => void;
			onScanComplete: (
				callback: (
					event: IpcRendererEvent,
					data: ScanCompleteEvent
				) => void
			) => () => void;
			onScanError: (
				callback: (
					event: IpcRendererEvent,
					error: ScanErrorEvent
				) => void
			) => () => void;
		};
	}
}

export class ElectronPlatform {
	readonly isElectron = true;
	readonly platform: "electron" | "web" = "electron";
	private readonly fileUrls = new Map<string, string>();

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
			(_event, data) => {
				if (data.type === "track" && data.data) {
					const { filepath, metadata } = data.data;

					// Use nullish coalescing to handle null metadata values properly
					const lrcPath = filepath.replace(
						/\.(m4a|mp3|flac|wav|aac|ogg|opus|wma|webm)$/i,
						".lrc"
					);

					// Log for debugging
					console.log("🎤 Generated LRC path:", {
						audioFile: filepath,
						lrcPath: lrcPath,
					});

					const track: Track = {
						id: uuidv4(),
						title:
							metadata.title ||
							this.getFilenameWithoutExtension(filepath),
						artist: metadata.artist || "Unknown Artist",
						album: metadata.album || "Unknown Album",
						albumArtist:
							metadata.albumArtist ||
							metadata.artist ||
							"Unknown Artist",
						duration: metadata.duration || 0,
						filepath,
						genre: metadata.genre || undefined,
						year: metadata.year || undefined,
						trackNumber: metadata.trackNumber || undefined,
						diskNumber: metadata.diskNumber || undefined,
						playCount: 0,
						dateAdded: new Date(),
						lrcPath: lrcPath, // Use the generated path
					};

					// Handle artwork
					if (metadata.picture && metadata.picture.length > 0) {
						try {
							const picture = metadata.picture[0]; // Get first picture from array
							const buffer = Buffer.isBuffer(picture.data)
								? picture.data
								: Buffer.from(picture.data);
							track.artwork = `data:${picture.format};base64,${buffer.toString("base64")}`;
						} catch (err) {
							console.error("Error processing artwork:", err);
						}
					}

					console.log("Track processed:", {
						title: track.title,
						artist: track.artist,
						album: track.album,
						filepath: track.filepath,
					});

					tracks.push(track);
				}
			}
		);

		const removeCompleteListener = window.musicAPI.onScanComplete(
			(_event, data) => {
				console.log(
					`Scan complete: ${data.processed} of ${data.total} files`
				);
				if (resolver) resolver();
			}
		);

		const removeErrorListener = window.musicAPI.onScanError(
			(_event, error) => {
				console.error("Scan error:", error.message);
				if (rejecter) rejecter(new Error(error.message));
			}
		);

		window.musicAPI.scanFolder(folderPath).catch((error) => {
			if (rejecter) rejecter(error);
		});

		try {
			await completionPromise;

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
		// Note: We could read the actual file stats here, but for now we just return basic info
		// The metadata itself is read separately via readMetadata
		return {
			name: this.getFilenameWithoutExtension(filepath),
			path: filepath,
			size: 0, // Could read actual size if needed
			modified: new Date(),
			type: "audio",
		};
	}

	async fileExists(filepath: string): Promise<boolean> {
		return window.musicAPI.checkFile(filepath);
	}

	async getAudioFileUrl(filepath: string): Promise<string> {
		// Normalize path separators to forward slashes
		const normalizedPath = filepath.replace(/\\/g, "/");

		// For Windows, ensure we have the drive letter
		// For Unix-like systems, ensure we start with /
		let url: string;
		if (/^[a-zA-Z]:/.test(normalizedPath)) {
			// Windows path - make sure it's formatted correctly
			url = `file:///${normalizedPath}`;
		} else if (normalizedPath.startsWith("/")) {
			// Unix path
			url = `file://${normalizedPath}`;
		} else {
			// Relative path (shouldn't happen, but handle it)
			url = `file:///${normalizedPath}`;
		}

		console.log("Generated audio URL:", url);
		console.log("Original filepath:", filepath);

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
