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

export function addMusicEventListeners(mainWindow: BrowserWindow) {
	ipcMain.handle(MUSIC_SELECT_FOLDER_CHANNEL, async () => {
		const result = await dialog.showOpenDialog(mainWindow, {
			properties: ["openDirectory"],
			title: "Select Music Folder",
		});
		return result.canceled ? null : result.filePaths[0];
	});

	ipcMain.handle(
		MUSIC_SCAN_FOLDER_CHANNEL,
		async (event, folderPath: string) => {
			try {
				const pattern = path.join(
					folderPath,
					"**/*.{m4a,mp3,flac,wav,aac,ogg}"
				);
				const files = await glob(pattern, {
					absolute: true,
					caseSensitiveMatch: false,
				});

				const total = files.length;
				let processed = 0;

				for (const filepath of files) {
					try {
						const metadata = await parseFile(filepath, {
							duration: true,
							skipCovers: false,
						});

						processed++;

						mainWindow.webContents.send(
							MUSIC_SCAN_PROGRESS_CHANNEL,
							{
								type: "track",
								data: {
									filepath,
									metadata: {
										title: metadata.common.title,
										artist: metadata.common.artist,
										album: metadata.common.album,
										albumArtist:
											metadata.common.albumartist,
										duration: metadata.format.duration,
										genre: metadata.common.genre,
										year: metadata.common.year,
										trackNumber: metadata.common.track?.no,
										diskNumber: metadata.common.disk?.no,
										picture: metadata.common.picture?.[0],
									},
								},
								progress: {
									current: processed,
									total,
									currentFile: path.basename(filepath),
								},
							}
						);
					} catch (fileError) {
						console.error(
							`Error processing ${filepath}:`,
							fileError
						);
					}
				}

				mainWindow.webContents.send(MUSIC_SCAN_COMPLETE_CHANNEL, {
					processed,
					total,
				});

				return { success: true, count: processed, total };
			} catch (error) {
				console.error("Scan error:", error);
				mainWindow.webContents.send(MUSIC_SCAN_ERROR_CHANNEL, {
					message:
						error instanceof Error
							? error.message
							: "Unknown error",
				});
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
					title: metadata.common.title,
					artist: metadata.common.artist,
					album: metadata.common.album,
					albumArtist: metadata.common.albumartist,
					duration: metadata.format.duration,
					genre: metadata.common.genre,
					year: metadata.common.year,
					trackNumber: metadata.common.track?.no,
					diskNumber: metadata.common.disk?.no,
					picture: metadata.common.picture?.[0],
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
			const url = new URL(`file://${filepath}`).href;
			return url;
		}
	);
}
