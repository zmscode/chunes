import { BrowserWindow, dialog, ipcMain } from "electron";
import { parseFile } from "music-metadata";
import { readFile, access } from "fs/promises";
import { constants } from "fs";
import * as path from "path";
import { glob } from "fast-glob";
import {
	MUSIC_SELECT_FOLDER_CHANNEL,
	MUSIC_SCAN_FOLDER_CHANNEL,
	MUSIC_READ_METADATA_CHANNEL,
	MUSIC_GET_FILE_CHANNEL,
	MUSIC_CHECK_FILE_CHANNEL,
	MUSIC_SCAN_PROGRESS_CHANNEL,
	MUSIC_SCAN_COMPLETE_CHANNEL,
	MUSIC_SCAN_ERROR_CHANNEL,
	MUSIC_GET_FILE_URL_CHANNEL,
} from "./music-channels";

export function addMusicEventListeners(
	getMainWindow: () => BrowserWindow | null
) {
	ipcMain.handle(MUSIC_SELECT_FOLDER_CHANNEL, async () => {
		const mainWindow = getMainWindow();
		if (!mainWindow) return null;

		const result = await dialog.showOpenDialog(mainWindow, {
			properties: ["openDirectory"],
			title: "Select Music Folder",
		});
		return result.canceled ? null : result.filePaths[0];
	});

	ipcMain.handle(
		MUSIC_SCAN_FOLDER_CHANNEL,
		async (event, folderPath: string) => {
			const mainWindow = getMainWindow();
			if (!mainWindow) {
				throw new Error("Main window not available");
			}

			try {
				const pattern = path.join(
					folderPath,
					"**/*.{m4a,mp3,flac,wav,aac,ogg,opus,wma}"
				);
				const files = await glob(pattern, {
					absolute: true,
					caseSensitiveMatch: false,
				});

				const total = files.length;
				let processed = 0;

				console.log(`Found ${total} audio files to process`);

				for (const filepath of files) {
					try {
						console.log(`\n📝 Processing: ${filepath}`);

						const metadata = await parseFile(filepath, {
							duration: true,
							skipCovers: false,
						});

						processed++;

						console.log(`📊 Raw metadata:`, {
							common: metadata.common,
							format: metadata.format,
						});

						// Extract genre array properly
						let genreArray: string[] | undefined = undefined;
						if (
							metadata.common.genre &&
							metadata.common.genre.length > 0
						) {
							genreArray = metadata.common.genre;
							console.log(`🎵 Genres found:`, genreArray);
						}

						// Extract picture
						let pictureData = null;
						if (
							metadata.common.picture &&
							metadata.common.picture.length > 0
						) {
							pictureData = metadata.common.picture[0];
							console.log(`🖼️ Picture found:`, {
								format: pictureData.format,
								dataSize: pictureData.data.length,
							});
						} else {
							console.log(`⚠️ No picture found in metadata`);
						}

						// Build metadata object with better fallbacks
						const trackMetadata = {
							title: metadata.common.title?.trim() || null,
							artist: metadata.common.artist?.trim() || null,
							album: metadata.common.album?.trim() || null,
							albumArtist:
								metadata.common.albumartist?.trim() || null,
							duration: metadata.format.duration || 0,
							genre: metadata.common.genre || undefined,
							year: metadata.common.year || null,
							trackNumber: metadata.common.track?.no || null,
							diskNumber: metadata.common.disk?.no || null,
							picture: pictureData
								? {
										format: pictureData.format,
										data: pictureData.data,
									}
								: null,
						};

						console.log(`✅ Processed metadata:`, {
							title: trackMetadata.title,
							artist: trackMetadata.artist,
							album: trackMetadata.album,
							albumArtist: trackMetadata.albumArtist,
							hasPicture: !!trackMetadata.picture,
						});

						// Check if window still exists before sending
						const currentWindow = getMainWindow();
						if (currentWindow && !currentWindow.isDestroyed()) {
							currentWindow.webContents.send(
								MUSIC_SCAN_PROGRESS_CHANNEL,
								{
									type: "track",
									data: {
										filepath,
										metadata: trackMetadata,
									},
									progress: {
										current: processed,
										total,
										currentFile: path.basename(filepath),
									},
								}
							);
						}
					} catch (fileError) {
						console.error(
							`Error processing ${filepath}:`,
							fileError
						);
						// Continue with next file even if this one fails
					}
				}

				// Check if window still exists before sending completion
				const currentWindow = getMainWindow();
				if (currentWindow && !currentWindow.isDestroyed()) {
					currentWindow.webContents.send(
						MUSIC_SCAN_COMPLETE_CHANNEL,
						{
							processed,
							total,
						}
					);
				}

				console.log(
					`Scan complete: ${processed}/${total} files processed`
				);

				return { success: true, count: processed, total };
			} catch (error) {
				console.error("Scan error:", error);

				// Check if window still exists before sending error
				const currentWindow = getMainWindow();
				if (currentWindow && !currentWindow.isDestroyed()) {
					currentWindow.webContents.send(MUSIC_SCAN_ERROR_CHANNEL, {
						message:
							error instanceof Error
								? error.message
								: "Unknown error",
					});
				}
				throw error;
			}
		}
	);

	ipcMain.handle(
		MUSIC_READ_METADATA_CHANNEL,
		async (event, filepath: string) => {
			try {
				const metadata = await parseFile(filepath, {
					duration: true,
					skipCovers: false,
				});

				return {
					title: metadata.common.title?.trim() || null,
					artist: metadata.common.artist?.trim() || null,
					album: metadata.common.album?.trim() || null,
					albumArtist: metadata.common.albumartist?.trim() || null,
					duration: metadata.format.duration || 0,
					genre: metadata.common.genre,
					year: metadata.common.year || null,
					trackNumber: metadata.common.track?.no || null,
					diskNumber: metadata.common.disk?.no || null,
					picture:
						metadata.common.picture &&
						metadata.common.picture.length > 0
							? metadata.common.picture[0]
							: null,
				};
			} catch (error) {
				console.error("Error reading metadata:", error);
				throw error;
			}
		}
	);

	ipcMain.handle(MUSIC_GET_FILE_CHANNEL, async (event, filepath: string) => {
		try {
			const buffer = await readFile(filepath);
			return buffer;
		} catch (error) {
			console.error("Error reading file:", error);
			throw error;
		}
	});

	ipcMain.handle(
		MUSIC_CHECK_FILE_CHANNEL,
		async (event, filepath: string) => {
			try {
				await access(filepath, constants.F_OK);
				return true;
			} catch {
				return false;
			}
		}
	);

	ipcMain.handle(
		MUSIC_GET_FILE_URL_CHANNEL,
		async (event, filepath: string) => {
			const normalizedPath = filepath.replace(/\\/g, "/");
			let url: string;

			if (/^[a-zA-Z]:/.test(normalizedPath)) {
				url = `file:///${normalizedPath}`;
			} else {
				url = `file://${normalizedPath}`;
			}

			console.log("Generated file URL:", url);
			return url;
		}
	);
}
