import type { PlatformService, FileMetadata } from "./PlatformService";
import type { ScanResult, Track } from "@types";
import { parseBlob } from "music-metadata-browser";
import { v4 as uuidv4 } from "uuid";

export class WebPlatform implements PlatformService {
	isElectron = false;
	platform: "electron" | "web" = "web";
	private audioUrls = new Map<string, string>();

	async selectFolder(): Promise<string | null> {
		if ("showDirectoryPicker" in window) {
			try {
				const handle = await (window as any).showDirectoryPicker({
					mode: "read",
				});
				(window as any).__musicFolderHandle = handle;
				return handle.name;
			} catch (error) {
				return null;
			}
		}

		return null;
	}

	async *scanMusicFolder(folderName: string): AsyncGenerator<ScanResult> {
		const handle = (window as any).__musicFolderHandle;
		if (!handle) {
			throw new Error("No folder selected");
		}

		const files: File[] = [];
		const supportedExtensions = [
			".m4a",
			".mp3",
			".flac",
			".wav",
			".aac",
			".ogg",
		];

		async function* walkDirectory(
			dirHandle: any,
			path = ""
		): AsyncGenerator<File> {
			for await (const entry of dirHandle.values()) {
				if (entry.kind === "file") {
					const file = await entry.getFile();
					const ext = "." + file.name.split(".").pop()?.toLowerCase();
					if (supportedExtensions.includes(ext)) {
						yield file;
					}
				} else if (entry.kind === "directory") {
					yield* walkDirectory(entry, path + entry.name + "/");
				}
			}
		}

		for await (const file of walkDirectory(handle)) {
			files.push(file);
		}

		const total = files.length;
		let current = 0;

		for (const file of files) {
			try {
				const metadata = await parseBlob(file, {
					duration: true,
					skipCovers: false,
				});

				current++;

				const track: Track = {
					id: uuidv4(),
					title:
						metadata.common.title ||
						this.getFilenameWithoutExtension(file.name),
					artist: metadata.common.artist || "Unknown Artist",
					album: metadata.common.album || "Unknown Album",
					albumArtist: metadata.common.albumartist,
					duration: metadata.format.duration || 0,
					filepath: file.name,
					genre: metadata.common.genre,
					year: metadata.common.year,
					trackNumber: metadata.common.track?.no,
					diskNumber: metadata.common.disk?.no,
					playCount: 0,
					dateAdded: new Date(),
					lrcPath: file.name.replace(
						/\.(m4a|mp3|flac|wav|aac|ogg)$/i,
						".lrc"
					),
				};

				if (
					metadata.common.picture &&
					metadata.common.picture.length > 0
				) {
					const picture = metadata.common.picture[0];
					const blob = new Blob([picture.data], {
						type: picture.format,
					});
					const url = URL.createObjectURL(blob);
					track.artwork = url;
				}

				(window as any).__musicFiles =
					(window as any).__musicFiles || new Map();
				(window as any).__musicFiles.set(file.name, file);

				yield {
					type: "track",
					track,
				};

				yield {
					type: "progress",
					progress: {
						current,
						total,
						currentFile: file.name,
					},
				};
			} catch (error) {
				console.error(`Error processing ${file.name}:`, error);
			}
		}
	}

	async readFile(filepath: string): Promise<ArrayBuffer> {
		const file = (window as any).__musicFiles?.get(filepath);
		if (!file) {
			throw new Error("File not found");
		}
		return file.arrayBuffer();
	}

	async writeFile(filepath: string, data: ArrayBuffer): Promise<void> {
		throw new Error("Write file not implemented for web");
	}

	async getFileMetadata(filepath: string): Promise<FileMetadata> {
		const file = (window as any).__musicFiles?.get(filepath);
		if (!file) {
			throw new Error("File not found");
		}

		return {
			name: this.getFilenameWithoutExtension(file.name),
			path: filepath,
			size: file.size,
			modified: new Date(file.lastModified),
			type: file.type,
		};
	}

	async fileExists(filepath: string): Promise<boolean> {
		return (window as any).__musicFiles?.has(filepath) || false;
	}

	async getAudioFileUrl(filepath: string): Promise<string> {
		if (this.audioUrls.has(filepath)) {
			return this.audioUrls.get(filepath)!;
		}

		const file = (window as any).__musicFiles?.get(filepath);
		if (!file) {
			throw new Error("File not found");
		}

		const url = URL.createObjectURL(file);
		this.audioUrls.set(filepath, url);
		return url;
	}

	releaseAudioUrl(url: string): void {
		URL.revokeObjectURL(url);

		for (const [path, storedUrl] of this.audioUrls.entries()) {
			if (storedUrl === url) {
				this.audioUrls.delete(path);
				break;
			}
		}
	}

	private getFilenameWithoutExtension(filename: string): string {
		return filename.replace(/\.(m4a|mp3|flac|wav|aac|ogg)$/i, "");
	}
}
