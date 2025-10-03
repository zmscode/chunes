declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_APPLE_MUSIC_TOKEN?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

interface ThemeModeContext {
	toggle: () => Promise<boolean>;
	dark: () => Promise<void>;
	light: () => Promise<void>;
	system: () => Promise<boolean>;
	current: () => Promise<"dark" | "light" | "system">;
}
interface ElectronWindow {
	minimize: () => Promise<void>;
	maximize: () => Promise<void>;
	close: () => Promise<void>;
}

declare interface Window {
	themeMode: ThemeModeContext;
	electronWindow: ElectronWindow;
}
