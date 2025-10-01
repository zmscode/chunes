"use strict";
const electron = require("electron");
const THEME_MODE_CURRENT_CHANNEL = "theme-mode:current";
const THEME_MODE_TOGGLE_CHANNEL = "theme-mode:toggle";
const THEME_MODE_DARK_CHANNEL = "theme-mode:dark";
const THEME_MODE_LIGHT_CHANNEL = "theme-mode:light";
const THEME_MODE_SYSTEM_CHANNEL = "theme-mode:system";
const WIN_MINIMIZE_CHANNEL = "window:minimize";
const WIN_MAXIMIZE_CHANNEL = "window:maximize";
const WIN_CLOSE_CHANNEL = "window:close";
const MUSIC_SELECT_FOLDER_CHANNEL = "music:select-folder";
const MUSIC_SCAN_FOLDER_CHANNEL = "music:scan-folder";
const MUSIC_READ_METADATA_CHANNEL = "music:read-metadata";
const MUSIC_GET_FILE_CHANNEL = "music:get-file";
const MUSIC_CHECK_FILE_CHANNEL = "music:check-file";
const MUSIC_SCAN_PROGRESS_CHANNEL = "music:scan-progress";
const MUSIC_SCAN_COMPLETE_CHANNEL = "music:scan-complete";
const MUSIC_SCAN_ERROR_CHANNEL = "music:scan-error";
const MUSIC_GET_FILE_URL_CHANNEL = "music:get-file-url";
electron.contextBridge.exposeInMainWorld("electronWindow", {
  minimize: () => electron.ipcRenderer.invoke(WIN_MINIMIZE_CHANNEL),
  maximize: () => electron.ipcRenderer.invoke(WIN_MAXIMIZE_CHANNEL),
  close: () => electron.ipcRenderer.invoke(WIN_CLOSE_CHANNEL)
});
electron.contextBridge.exposeInMainWorld("themeMode", {
  current: () => electron.ipcRenderer.invoke(THEME_MODE_CURRENT_CHANNEL),
  toggle: () => electron.ipcRenderer.invoke(THEME_MODE_TOGGLE_CHANNEL),
  dark: () => electron.ipcRenderer.invoke(THEME_MODE_DARK_CHANNEL),
  light: () => electron.ipcRenderer.invoke(THEME_MODE_LIGHT_CHANNEL),
  system: () => electron.ipcRenderer.invoke(THEME_MODE_SYSTEM_CHANNEL)
});
electron.contextBridge.exposeInMainWorld("musicAPI", {
  selectFolder: () => electron.ipcRenderer.invoke(MUSIC_SELECT_FOLDER_CHANNEL),
  scanFolder: (path) => electron.ipcRenderer.invoke(MUSIC_SCAN_FOLDER_CHANNEL, path),
  readMetadata: (path) => electron.ipcRenderer.invoke(MUSIC_READ_METADATA_CHANNEL, path),
  getFile: (path) => electron.ipcRenderer.invoke(MUSIC_GET_FILE_CHANNEL, path),
  checkFile: (path) => electron.ipcRenderer.invoke(MUSIC_CHECK_FILE_CHANNEL, path),
  getFileUrl: (path) => electron.ipcRenderer.invoke(MUSIC_GET_FILE_URL_CHANNEL, path),
  onScanProgress: (callback) => {
    electron.ipcRenderer.on(MUSIC_SCAN_PROGRESS_CHANNEL, callback);
    return () => electron.ipcRenderer.removeListener(MUSIC_SCAN_PROGRESS_CHANNEL, callback);
  },
  onScanComplete: (callback) => {
    electron.ipcRenderer.on(MUSIC_SCAN_COMPLETE_CHANNEL, callback);
    return () => electron.ipcRenderer.removeListener(MUSIC_SCAN_COMPLETE_CHANNEL, callback);
  },
  onScanError: (callback) => {
    electron.ipcRenderer.on(MUSIC_SCAN_ERROR_CHANNEL, callback);
    return () => electron.ipcRenderer.removeListener(MUSIC_SCAN_ERROR_CHANNEL, callback);
  }
});
console.log("✅ Preload script loaded successfully!");
console.log("Available APIs:", {
  electronWindow: !!window.electronWindow,
  themeMode: !!window.themeMode,
  musicAPI: !!window.musicAPI
});
