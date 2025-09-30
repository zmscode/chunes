"use strict";
const THEME_MODE_CURRENT_CHANNEL = "theme-mode:current";
const THEME_MODE_TOGGLE_CHANNEL = "theme-mode:toggle";
const THEME_MODE_DARK_CHANNEL = "theme-mode:dark";
const THEME_MODE_LIGHT_CHANNEL = "theme-mode:light";
const THEME_MODE_SYSTEM_CHANNEL = "theme-mode:system";
function exposeThemeContext() {
  const { contextBridge, ipcRenderer } = window.require("electron");
  contextBridge.exposeInMainWorld("themeMode", {
    current: () => ipcRenderer.invoke(THEME_MODE_CURRENT_CHANNEL),
    toggle: () => ipcRenderer.invoke(THEME_MODE_TOGGLE_CHANNEL),
    dark: () => ipcRenderer.invoke(THEME_MODE_DARK_CHANNEL),
    light: () => ipcRenderer.invoke(THEME_MODE_LIGHT_CHANNEL),
    system: () => ipcRenderer.invoke(THEME_MODE_SYSTEM_CHANNEL)
  });
}
const WIN_MINIMIZE_CHANNEL = "window:minimize";
const WIN_MAXIMIZE_CHANNEL = "window:maximize";
const WIN_CLOSE_CHANNEL = "window:close";
function exposeWindowContext() {
  const { contextBridge, ipcRenderer } = window.require("electron");
  contextBridge.exposeInMainWorld("electronWindow", {
    minimize: () => ipcRenderer.invoke(WIN_MINIMIZE_CHANNEL),
    maximize: () => ipcRenderer.invoke(WIN_MAXIMIZE_CHANNEL),
    close: () => ipcRenderer.invoke(WIN_CLOSE_CHANNEL)
  });
}
const MUSIC_SELECT_FOLDER_CHANNEL = "music:select-folder";
const MUSIC_SCAN_FOLDER_CHANNEL = "music:scan-folder";
const MUSIC_READ_METADATA_CHANNEL = "music:read-metadata";
const MUSIC_GET_FILE_CHANNEL = "music:get-file";
const MUSIC_CHECK_FILE_CHANNEL = "music:check-file";
const MUSIC_SCAN_PROGRESS_CHANNEL = "music:scan-progress";
const MUSIC_SCAN_COMPLETE_CHANNEL = "music:scan-complete";
const MUSIC_SCAN_ERROR_CHANNEL = "music:scan-error";
const MUSIC_GET_FILE_URL_CHANNEL = "music:get-file-url";
function exposeMusicContext() {
  const { contextBridge, ipcRenderer } = window.require("electron");
  contextBridge.exposeInMainWorld("musicAPI", {
    selectFolder: () => ipcRenderer.invoke(MUSIC_SELECT_FOLDER_CHANNEL),
    scanFolder: (path) => ipcRenderer.invoke(MUSIC_SCAN_FOLDER_CHANNEL, path),
    readMetadata: (path) => ipcRenderer.invoke(MUSIC_READ_METADATA_CHANNEL, path),
    getFile: (path) => ipcRenderer.invoke(MUSIC_GET_FILE_CHANNEL, path),
    checkFile: (path) => ipcRenderer.invoke(MUSIC_CHECK_FILE_CHANNEL, path),
    getFileUrl: (path) => ipcRenderer.invoke(MUSIC_GET_FILE_URL_CHANNEL, path),
    onScanProgress: (callback) => {
      ipcRenderer.on(MUSIC_SCAN_PROGRESS_CHANNEL, callback);
      return () => ipcRenderer.removeListener(
        MUSIC_SCAN_PROGRESS_CHANNEL,
        callback
      );
    },
    onScanComplete: (callback) => {
      ipcRenderer.on(MUSIC_SCAN_COMPLETE_CHANNEL, callback);
      return () => ipcRenderer.removeListener(
        MUSIC_SCAN_COMPLETE_CHANNEL,
        callback
      );
    },
    onScanError: (callback) => {
      ipcRenderer.on(MUSIC_SCAN_ERROR_CHANNEL, callback);
      return () => ipcRenderer.removeListener(MUSIC_SCAN_ERROR_CHANNEL, callback);
    }
  });
}
function exposeContexts() {
  exposeWindowContext();
  exposeThemeContext();
  exposeMusicContext();
}
exposeContexts();
