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
import { IpcRendererEvent } from "electron";
import {
	ParsedMetadata,
	ScanCompleteData,
	ScanErrorData,
	ScanProgressData,
} from "@types";

export function exposeMusicContext() {
	const { contextBridge, ipcRenderer } = window.require("electron");

	contextBridge.exposeInMainWorld("musicAPI", {
		selectFolder: (): Promise<string | null> =>
			ipcRenderer.invoke(MUSIC_SELECT_FOLDER_CHANNEL),

		scanFolder: (
			path: string
		): Promise<{ success: boolean; count: number; total: number }> =>
			ipcRenderer.invoke(MUSIC_SCAN_FOLDER_CHANNEL, path),

		readMetadata: (path: string): Promise<ParsedMetadata> =>
			ipcRenderer.invoke(MUSIC_READ_METADATA_CHANNEL, path),

		getFile: (path: string): Promise<ArrayBuffer> =>
			ipcRenderer.invoke(MUSIC_GET_FILE_CHANNEL, path),

		checkFile: (path: string): Promise<boolean> =>
			ipcRenderer.invoke(MUSIC_CHECK_FILE_CHANNEL, path),

		getFileUrl: (path: string): Promise<string> =>
			ipcRenderer.invoke(MUSIC_GET_FILE_URL_CHANNEL, path),

		onScanProgress: (
			callback: (event: IpcRendererEvent, data: ScanProgressData) => void
		): (() => void) => {
			ipcRenderer.on(MUSIC_SCAN_PROGRESS_CHANNEL, callback);
			return () =>
				ipcRenderer.removeListener(
					MUSIC_SCAN_PROGRESS_CHANNEL,
					callback
				);
		},

		onScanComplete: (
			callback: (event: IpcRendererEvent, data: ScanCompleteData) => void
		): (() => void) => {
			ipcRenderer.on(MUSIC_SCAN_COMPLETE_CHANNEL, callback);
			return () =>
				ipcRenderer.removeListener(
					MUSIC_SCAN_COMPLETE_CHANNEL,
					callback
				);
		},

		onScanError: (
			callback: (event: IpcRendererEvent, error: ScanErrorData) => void
		): (() => void) => {
			ipcRenderer.on(MUSIC_SCAN_ERROR_CHANNEL, callback);
			return () =>
				ipcRenderer.removeListener(MUSIC_SCAN_ERROR_CHANNEL, callback);
		},
	});
}
