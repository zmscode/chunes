import { BrowserWindow } from "electron";
import { addThemeEventListeners } from "./theme/theme-listeners";
import { addWindowEventListeners } from "./window/window-listeners";
import { addMusicEventListeners } from "./music/music-listeners";

export default function registerListeners(mainWindow: BrowserWindow) {
	addWindowEventListeners(mainWindow);
	addThemeEventListeners();
	addMusicEventListeners(mainWindow);
}
