import { BrowserWindow } from "electron";
import { addThemeEventListeners } from "./theme/theme-listeners";
import { addWindowEventListeners } from "./window/window-listeners";
import { addMusicEventListeners } from "./music/music-listeners";

export default function registerListeners(
	getMainWindow: () => BrowserWindow | null
) {
	console.log("🎧 Registering IPC listeners...");
	addWindowEventListeners(getMainWindow);
	addThemeEventListeners();
	addMusicEventListeners(getMainWindow);
	console.log("✅ IPC listeners registered successfully");
}
