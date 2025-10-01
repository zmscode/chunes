import type {
	FileMetadata,
	ParsedMetadata,
	ScanResult,
	Track,
	ScanFolderResult,
	ScanProgressEvent,
	ScanCompleteEvent,
	ScanErrorEvent,
} from "@types";
import type { IpcRendererEvent } from "electron";
import { v4 as uuidv4 } from "uuid";

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

					const lrcPath = filepath.replace(
						/\.(m4a|mp3|flac|wav|aac|ogg|opus|wma|webm)$/i,
						".lrc"
					);

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
						lrcPath: lrcPath,
					};

					if (metadata.picture && metadata.picture.length > 0) {
						try {
							const picture = metadata.picture[0];
							const uint8Array =
								picture.data instanceof Uint8Array
									? picture.data
									: new Uint8Array(picture.data);

							const arrayBuffer = uint8Array.buffer.slice(
								uint8Array.byteOffset,
								uint8Array.byteOffset + uint8Array.byteLength
							) as ArrayBuffer;

							const blob = new Blob([arrayBuffer], {
								type: picture.format,
							});
							track.artwork = URL.createObjectURL(blob);
						} catch (err) {
							console.error("Error processing artwork:", err);
						}
					}

					console.log("Track processed with LRC path:", {
						title: track.title,
						filepath: track.filepath,
						lrcPath: track.lrcPath,
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
		if (this.fileUrls.has(filepath)) {
			return this.fileUrls.get(filepath)!;
		}

		try {
			const arrayBuffer = await window.musicAPI.getFile(filepath);

			const ext = filepath.toLowerCase().split(".").pop();
			const mimeTypes: Record<string, string> = {
				mp3: "audio/mpeg",
				m4a: "audio/mp4",
				aac: "audio/aac",
				ogg: "audio/ogg",
				opus: "audio/opus",
				wav: "audio/wav",
				flac: "audio/flac",
				wma: "audio/x-ms-wma",
				webm: "audio/webm",
			};
			const mimeType = mimeTypes[ext || "mp3"] || "audio/mpeg";

			const blob = new Blob([arrayBuffer], { type: mimeType });
			const url = URL.createObjectURL(blob);

			this.fileUrls.set(filepath, url);
			return url;
		} catch (error) {
			console.error("Failed to create audio URL:", error);
			throw error;
		}
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
