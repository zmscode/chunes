import { contextBridge, ipcRenderer } from "electron";
import {
	THEME_MODE_CURRENT_CHANNEL,
	THEME_MODE_DARK_CHANNEL,
	THEME_MODE_LIGHT_CHANNEL,
	THEME_MODE_SYSTEM_CHANNEL,
	THEME_MODE_TOGGLE_CHANNEL,
} from "./utils/helpers/ipc/theme/theme-channels";
import {
	WIN_CLOSE_CHANNEL,
	WIN_MAXIMIZE_CHANNEL,
	WIN_MINIMIZE_CHANNEL,
} from "./utils/helpers/ipc/window/window-channels";
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
} from "./utils/helpers/ipc/music/music-channels";

contextBridge.exposeInMainWorld("electronWindow", {
	minimize: () => ipcRenderer.invoke(WIN_MINIMIZE_CHANNEL),
	maximize: () => ipcRenderer.invoke(WIN_MAXIMIZE_CHANNEL),
	close: () => ipcRenderer.invoke(WIN_CLOSE_CHANNEL),
});

contextBridge.exposeInMainWorld("themeMode", {
	current: () => ipcRenderer.invoke(THEME_MODE_CURRENT_CHANNEL),
	toggle: () => ipcRenderer.invoke(THEME_MODE_TOGGLE_CHANNEL),
	dark: () => ipcRenderer.invoke(THEME_MODE_DARK_CHANNEL),
	light: () => ipcRenderer.invoke(THEME_MODE_LIGHT_CHANNEL),
	system: () => ipcRenderer.invoke(THEME_MODE_SYSTEM_CHANNEL),
});

contextBridge.exposeInMainWorld("musicAPI", {
	selectFolder: () => ipcRenderer.invoke(MUSIC_SELECT_FOLDER_CHANNEL),

	scanFolder: (path: string) =>
		ipcRenderer.invoke(MUSIC_SCAN_FOLDER_CHANNEL, path),

	readMetadata: (path: string) =>
		ipcRenderer.invoke(MUSIC_READ_METADATA_CHANNEL, path),

	getFile: (path: string) => ipcRenderer.invoke(MUSIC_GET_FILE_CHANNEL, path),

	checkFile: (path: string) =>
		ipcRenderer.invoke(MUSIC_CHECK_FILE_CHANNEL, path),

	getFileUrl: (path: string) =>
		ipcRenderer.invoke(MUSIC_GET_FILE_URL_CHANNEL, path),

	onScanProgress: (callback: (event: any, data: any) => void) => {
		ipcRenderer.on(MUSIC_SCAN_PROGRESS_CHANNEL, callback);
		return () =>
			ipcRenderer.removeListener(MUSIC_SCAN_PROGRESS_CHANNEL, callback);
	},

	onScanComplete: (callback: (event: any, data: any) => void) => {
		ipcRenderer.on(MUSIC_SCAN_COMPLETE_CHANNEL, callback);
		return () =>
			ipcRenderer.removeListener(MUSIC_SCAN_COMPLETE_CHANNEL, callback);
	},

	onScanError: (callback: (event: any, error: any) => void) => {
		ipcRenderer.on(MUSIC_SCAN_ERROR_CHANNEL, callback);
		return () =>
			ipcRenderer.removeListener(MUSIC_SCAN_ERROR_CHANNEL, callback);
	},
});
