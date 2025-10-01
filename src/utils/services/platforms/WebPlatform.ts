import type {
	DirectoryHandle,
	FileMetadata,
	PlatformService,
	ScanResult,
	Track,
} from "@types";
import { parseBlob } from "music-metadata";
import { v4 as uuidv4 } from "uuid";

interface MusicWindow extends Window {
	showDirectoryPicker?: (options?: {
		mode: string;
	}) => Promise<DirectoryHandle>;
	__musicFolderHandle?: DirectoryHandle;
	__musicFiles?: Map<string, File>;
}

export class WebPlatform implements PlatformService {
	isElectron = false;
	platform: "electron" | "web" = "web";
	private audioUrls = new Map<string, string>();

	async selectFolder(): Promise<string | null> {
		const musicWindow = window as MusicWindow;

		if (
			"showDirectoryPicker" in musicWindow &&
			musicWindow.showDirectoryPicker
		) {
			try {
				const handle = await musicWindow.showDirectoryPicker({
					mode: "read",
				});
				musicWindow.__musicFolderHandle = handle;
				return handle.name;
			} catch (error) {
				return null;
			}
		}

		return null;
	}

	async *scanMusicFolder(folderName: string): AsyncGenerator<ScanResult> {
		const musicWindow = window as MusicWindow;
		const handle = musicWindow.__musicFolderHandle;

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

		const fileMap = new Map<string, File>();

		async function* walkDirectory(
			dirHandle: DirectoryHandle,
			path = ""
		): AsyncGenerator<{ file: File; path: string }> {
			for await (const entry of dirHandle.values()) {
				if (entry.kind === "file") {
					const file = await entry.getFile();
					const fullPath = path + file.name;

					fileMap.set(fullPath, file);

					const ext = "." + file.name.split(".").pop()?.toLowerCase();
					if (supportedExtensions.includes(ext)) {
						yield { file, path: fullPath };
					}
				} else if (entry.kind === "directory") {
					yield* walkDirectory(entry, path + entry.name + "/");
				}
			}
		}

		for await (const { file, path: filePath } of walkDirectory(handle)) {
			files.push(file);
		}

		if (!musicWindow.__musicFiles) {
			musicWindow.__musicFiles = new Map();
		}

		for (const [path, file] of fileMap.entries()) {
			musicWindow.__musicFiles.set(path, file);
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

				console.log(`📝 Processing: ${file.name}`);
				console.log(`📊 Raw metadata:`, {
					title: metadata.common.title,
					artist: metadata.common.artist,
					artists: metadata.common.artists,
					album: metadata.common.album,
					albumArtist: metadata.common.albumartist,
				});

				const lrcFilename = file.name.replace(
					/\.(m4a|mp3|flac|wav|aac|ogg)$/i,
					".lrc"
				);

				const track: Track = {
					id: uuidv4(),
					title:
						metadata.common.title ||
						this.getFilenameWithoutExtension(file.name),
					artist:
						metadata.common.artists?.[0] ||
						metadata.common.artist ||
						"Unknown Artist",
					album: metadata.common.album || "Unknown Album",
					albumArtist:
						metadata.common.albumartist ||
						metadata.common.artists?.[0] ||
						metadata.common.artist,
					duration: metadata.format.duration || 0,
					filepath: file.name,
					genre: metadata.common.genre,
					year: metadata.common.year,
					trackNumber: metadata.common.track?.no ?? undefined,
					diskNumber: metadata.common.disk?.no ?? undefined,
					playCount: 0,
					dateAdded: new Date(),
					lrcPath: lrcFilename,
				};

				if (
					metadata.common.picture &&
					metadata.common.picture.length > 0
				) {
					const picture = metadata.common.picture[0];
					const dataArray =
						picture.data instanceof Uint8Array
							? picture.data
							: new Uint8Array(picture.data);
					const blob = new Blob([dataArray as BlobPart], {
						type: picture.format,
					});
					const url = URL.createObjectURL(blob);
					track.artwork = url;
				}

				console.log(`✅ Processed track:`, {
					title: track.title,
					artist: track.artist,
					album: track.album,
					hasArtwork: !!track.artwork,
				});

				musicWindow.__musicFiles.set(file.name, file);

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
				console.error(`❌ Error processing ${file.name}:`, error);
			}
		}

		console.log(`📁 Total files stored: ${musicWindow.__musicFiles.size}`);
		console.log(`📁 Files:`, Array.from(musicWindow.__musicFiles.keys()));
	}

	async readFile(filepath: string): Promise<ArrayBuffer> {
		const musicWindow = window as MusicWindow;
		const file = musicWindow.__musicFiles?.get(filepath);
		if (!file) {
			console.error(`File not found: ${filepath}`);
			console.log(
				`Available files:`,
				Array.from(musicWindow.__musicFiles?.keys() || [])
			);
			throw new Error(`File not found: ${filepath}`);
		}
		return file.arrayBuffer();
	}

	async writeFile(filepath: string, data: ArrayBuffer): Promise<void> {
		throw new Error("Write file not implemented for web");
	}

	async getFileMetadata(filepath: string): Promise<FileMetadata> {
		const musicWindow = window as MusicWindow;
		const file = musicWindow.__musicFiles?.get(filepath);
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
		const musicWindow = window as MusicWindow;
		const exists = musicWindow.__musicFiles?.has(filepath) || false;

		if (!exists) {
			console.log(`🔍 File existence check failed for: ${filepath}`);
			console.log(
				`📁 Available files:`,
				Array.from(musicWindow.__musicFiles?.keys() || []).filter((f) =>
					f.endsWith(".lrc")
				)
			);
		}

		return exists;
	}

	async getAudioFileUrl(filepath: string): Promise<string> {
		if (this.audioUrls.has(filepath)) {
			return this.audioUrls.get(filepath)!;
		}

		const musicWindow = window as MusicWindow;
		const file = musicWindow.__musicFiles?.get(filepath);
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
