import { Store } from "@tanstack/store";
import { SettingsState } from "@types";

const SETTINGS_STORAGE_KEY = "chunes-settings";

const loadSettings = (): Partial<SettingsState> => {
	if (typeof window === "undefined") return {};

	try {
		const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
		return stored ? JSON.parse(stored) : {};
	} catch {
		return {};
	}
};

const defaultSettings: SettingsState = {
	musicFolder: "",
	theme: "system",
	language: "en",
	crossfadeDuration: 2,
	equalizerPreset: "flat",
	showLyrics: true,
	scrobbleLastFm: false,
};

export const settingsStore = new Store<SettingsState>({
	...defaultSettings,
	...loadSettings(),
});

settingsStore.subscribe((state) => {
	if (typeof window !== "undefined") {
		localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(state));
	}
});

export const settingsActions = {
	setMusicFolder: (folder: string) =>
		settingsStore.setState((state) => ({ ...state, musicFolder: folder })),

	setTheme: (theme: SettingsState["theme"]) =>
		settingsStore.setState((state) => ({ ...state, theme })),

	setLanguage: (language: string) =>
		settingsStore.setState((state) => ({ ...state, language })),

	setCrossfadeDuration: (duration: number) =>
		settingsStore.setState((state) => ({
			...state,
			crossfadeDuration: Math.max(0, Math.min(10, duration)),
		})),

	setEqualizerPreset: (preset: string) =>
		settingsStore.setState((state) => ({
			...state,
			equalizerPreset: preset,
		})),

	toggleLyrics: () =>
		settingsStore.setState((state) => ({
			...state,
			showLyrics: !state.showLyrics,
		})),

	toggleScrobbling: () =>
		settingsStore.setState((state) => ({
			...state,
			scrobbleLastFm: !state.scrobbleLastFm,
		})),

	resetSettings: () => settingsStore.setState(() => defaultSettings),
};
