import { BrowserWindow, ipcMain } from "electron";
import {
	WIN_CLOSE_CHANNEL,
	WIN_MAXIMIZE_CHANNEL,
	WIN_MINIMIZE_CHANNEL,
} from "./window-channels";

export function addWindowEventListeners(
	getMainWindow: () => BrowserWindow | null
) {
	ipcMain.handle(WIN_MINIMIZE_CHANNEL, () => {
		const mainWindow = getMainWindow();
		if (mainWindow) {
			mainWindow.minimize();
		}
	});
	ipcMain.handle(WIN_MAXIMIZE_CHANNEL, () => {
		const mainWindow = getMainWindow();
		if (mainWindow) {
			if (mainWindow.isMaximized()) {
				mainWindow.unmaximize();
			} else {
				mainWindow.maximize();
			}
		}
	});
	ipcMain.handle(WIN_CLOSE_CHANNEL, () => {
		const mainWindow = getMainWindow();
		if (mainWindow) {
			mainWindow.close();
		}
	});
}
