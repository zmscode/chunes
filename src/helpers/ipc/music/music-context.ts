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

export function exposeMusicContext() {
	const { contextBridge, ipcRenderer } = window.require("electron");

	contextBridge.exposeInMainWorld("musicAPI", {
		selectFolder: () => ipcRenderer.invoke(MUSIC_SELECT_FOLDER_CHANNEL),

		scanFolder: (path: string) =>
			ipcRenderer.invoke(MUSIC_SCAN_FOLDER_CHANNEL, path),

		readMetadata: (path: string) =>
			ipcRenderer.invoke(MUSIC_READ_METADATA_CHANNEL, path),

		getFile: (path: string) =>
			ipcRenderer.invoke(MUSIC_GET_FILE_CHANNEL, path),

		checkFile: (path: string) =>
			ipcRenderer.invoke(MUSIC_CHECK_FILE_CHANNEL, path),

		getFileUrl: (path: string) =>
			ipcRenderer.invoke(MUSIC_GET_FILE_URL_CHANNEL, path),

		onScanProgress: (callback: (event: any, data: any) => void) => {
			ipcRenderer.on(MUSIC_SCAN_PROGRESS_CHANNEL, callback);
			return () =>
				ipcRenderer.removeListener(
					MUSIC_SCAN_PROGRESS_CHANNEL,
					callback
				);
		},

		onScanComplete: (callback: (event: any, data: any) => void) => {
			ipcRenderer.on(MUSIC_SCAN_COMPLETE_CHANNEL, callback);
			return () =>
				ipcRenderer.removeListener(
					MUSIC_SCAN_COMPLETE_CHANNEL,
					callback
				);
		},

		onScanError: (callback: (event: any, error: any) => void) => {
			ipcRenderer.on(MUSIC_SCAN_ERROR_CHANNEL, callback);
			return () =>
				ipcRenderer.removeListener(MUSIC_SCAN_ERROR_CHANNEL, callback);
		},
	});
}
