import {
	createContext,
	useContext,
	useEffect,
	useState,
	useCallback,
	useRef,
	ReactNode,
	JSX,
} from "react";
import { AudioEngine, VisualizerData } from "@services/audio/AudioEngine";
import {
	usePlayerStore,
	useLibraryStore,
	useSettingsStore,
} from "@hooks/useStore";
import { getPlatformService } from "@services/platforms";
import type { Track } from "@types";

interface AudioContextValue {
	isInitialized: boolean;
	isLoading: boolean;
	error: string | null;
	currentTime: number;
	duration: number;
	volume: number;
	playbackRate: number;
	visualizerData: VisualizerData | null;
	equalizerGains: number[];

	playTrack: (track: Track) => Promise<void>;
	play: () => Promise<void>;
	pause: () => void;
	stop: () => void;
	seek: (time: number) => void;
	setVolume: (volume: number, fade?: boolean) => void;
	setPlaybackRate: (rate: number) => void;
	setEqualizerGain: (band: number, gain: number) => void;
	resetEqualizer: () => void;
	applyEqualizerPreset: (
		preset: "flat" | "bass" | "vocal" | "treble"
	) => void;
	playNext: () => Promise<void>;
	playPrevious: () => Promise<void>;
	togglePlayPause: () => Promise<void>;
}

const AudioContext = createContext<AudioContextValue | undefined>(undefined);

export function useAudio(): AudioContextValue {
	const context = useContext(AudioContext);
	if (!context) {
		throw new Error("useAudio must be used within AudioProvider");
	}
	return context;
}

interface AudioProviderProps {
	children: ReactNode;
}

export function AudioProvider({ children }: AudioProviderProps): JSX.Element {
	const platformService = getPlatformService();
	const audioEngineRef = useRef<AudioEngine | null>(null);

	const { actions: playerActions, ...playerState } = usePlayerStore();
	const { tracks } = useLibraryStore();
	const { crossfadeDuration, equalizerPreset } = useSettingsStore();

	const [isInitialized, setIsInitialized] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [volume, setVolume] = useState(1);
	const [playbackRate, setPlaybackRate] = useState(1);
	const [visualizerData, setVisualizerData] = useState<VisualizerData | null>(
		null
	);
	const [equalizerGains, setEqualizerGains] = useState<number[]>([
		0, 0, 0, 0, 0, 0,
	]);

	const visualizerIntervalRef = useRef<number | null>(null);

	useEffect(() => {
		const initAudioEngine = async () => {
			try {
				const engine = new AudioEngine({
					crossfadeDuration,
					preloadNext: true,
					volumeFadeTime: 200,
					autoUnlock: true,
				});

				audioEngineRef.current = engine;

				engine.on("play", () => {
					playerActions.play();
				});

				engine.on("pause", () => {
					playerActions.pause();
				});

				engine.on("ended", async () => {
					await handleTrackEnded();
				});

				engine.on("timeupdate", (time) => {
					setCurrentTime(time);
					playerActions.updateTime(time);
				});

				engine.on("durationchange", (dur) => {
					setDuration(dur);
				});

				engine.on("volumechange", (vol) => {
					setVolume(vol);
					playerActions.setVolume(vol);
				});

				engine.on("error", (err) => {
					setError(err.message);
					console.error("Audio engine error:", err);
				});

				engine.on("initialized", () => {
					setIsInitialized(true);
				});

				engine.on("loadstart", () => {
					setIsLoading(true);
				});

				engine.on("loadeddata", () => {
					setIsLoading(false);
				});

				await engine.initialize();

				// Apply initial equalizer preset
				if (equalizerPreset !== "flat") {
					engine.applyEqualizerPreset(
						equalizerPreset as "flat" | "bass" | "vocal" | "treble"
					);
					setEqualizerGains(engine.getEqualizerGains());
				}
			} catch (err) {
				const errorMessage =
					err instanceof Error
						? err.message
						: "Failed to initialize audio engine";
				setError(errorMessage);
				console.error("Audio initialization error:", err);
			}
		};

		initAudioEngine();

		return () => {
			if (audioEngineRef.current) {
				audioEngineRef.current.destroy();
			}
			if (visualizerIntervalRef.current) {
				clearInterval(visualizerIntervalRef.current);
			}
		};
	}, []);

	useEffect(() => {
		if (!audioEngineRef.current || !playerState.isPlaying) {
			if (visualizerIntervalRef.current) {
				clearInterval(visualizerIntervalRef.current);
				visualizerIntervalRef.current = null;
			}
			setVisualizerData(null);
			return;
		}

		visualizerIntervalRef.current = window.setInterval(() => {
			if (audioEngineRef.current) {
				const data = audioEngineRef.current.getVisualizerData();
				setVisualizerData(data);
			}
		}, 50);

		return () => {
			if (visualizerIntervalRef.current) {
				clearInterval(visualizerIntervalRef.current);
			}
		};
	}, [playerState.isPlaying]);

	const playTrack = useCallback(
		async (track: Track) => {
			if (!audioEngineRef.current) {
				console.error("Audio engine not initialized");
				setError("Audio engine not initialized");
				return;
			}

			try {
				console.log("Playing track:", track.title, track.filepath);
				setError(null);
				setIsLoading(true);

				const url = await platformService.getAudioFileUrl(
					track.filepath
				);
				console.log("Got audio URL:", url);

				const exists = await platformService.fileExists(track.filepath);
				if (!exists) {
					throw new Error(`File not found: ${track.filepath}`);
				}

				console.log("Loading track into audio engine...");
				await audioEngineRef.current.loadTrack(url, track);

				console.log("Setting current track in player store...");
				playerActions.setCurrentTrack(track.id, track.duration);

				console.log("Starting playback...");
				await audioEngineRef.current.play();

				console.log("Track playing successfully!");

				const currentIndex = playerState.queue.indexOf(track.id);
				if (
					currentIndex !== -1 &&
					currentIndex < playerState.queue.length - 1
				) {
					const nextTrackId = playerState.queue[currentIndex + 1];
					const nextTrack = tracks.get(nextTrackId);
					if (nextTrack) {
						console.log("Preloading next track:", nextTrack.title);
						const nextUrl = await platformService.getAudioFileUrl(
							nextTrack.filepath
						);
						await audioEngineRef.current.preloadNextTrack(
							nextUrl,
							nextTrack
						);
					}
				}
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Failed to play track";
				console.error("Play track error:", err);
				setError(errorMessage);
			} finally {
				setIsLoading(false);
			}
		},
		[playerActions, playerState.queue, tracks, platformService]
	);

	const play = useCallback(async () => {
		if (!audioEngineRef.current) return;

		try {
			await audioEngineRef.current.play();
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Failed to play";
			setError(errorMessage);
		}
	}, []);

	const pause = useCallback(() => {
		if (!audioEngineRef.current) return;
		audioEngineRef.current.pause();
	}, []);

	const stop = useCallback(() => {
		if (!audioEngineRef.current) return;
		audioEngineRef.current.stop();
		setCurrentTime(0);
		playerActions.pause();
	}, [playerActions]);

	const seek = useCallback((time: number) => {
		if (!audioEngineRef.current) return;
		audioEngineRef.current.seek(time);
		setCurrentTime(time);
	}, []);

	const setVolumeHandler = useCallback(
		(newVolume: number, fade: boolean = false) => {
			if (!audioEngineRef.current) return;
			audioEngineRef.current.setVolume(newVolume, fade);
		},
		[]
	);

	const setPlaybackRateHandler = useCallback((rate: number) => {
		if (!audioEngineRef.current) return;
		audioEngineRef.current.setPlaybackRate(rate);
		setPlaybackRate(rate);
	}, []);

	const setEqualizerGain = useCallback((band: number, gain: number) => {
		if (!audioEngineRef.current) return;
		audioEngineRef.current.setEqualizerGain(band, gain);
		setEqualizerGains(audioEngineRef.current.getEqualizerGains());
	}, []);

	const resetEqualizer = useCallback(() => {
		if (!audioEngineRef.current) return;
		audioEngineRef.current.resetEqualizer();
		setEqualizerGains(audioEngineRef.current.getEqualizerGains());
	}, []);

	const applyEqualizerPreset = useCallback(
		(preset: "flat" | "bass" | "vocal" | "treble") => {
			if (!audioEngineRef.current) return;
			audioEngineRef.current.applyEqualizerPreset(preset);
			setEqualizerGains(audioEngineRef.current.getEqualizerGains());
		},
		[]
	);

	const handleTrackEnded = async () => {
		playerActions.playNext();

		const nextTrackId = playerState.queue[playerState.queueIndex + 1];
		if (nextTrackId) {
			const nextTrack = tracks.get(nextTrackId);
			if (nextTrack) {
				await playTrack(nextTrack);
			}
		}
	};

	const playNext = useCallback(async () => {
		const nextIndex = playerState.queueIndex + 1;
		if (nextIndex < playerState.queue.length) {
			const nextTrackId = playerState.queue[nextIndex];
			const nextTrack = tracks.get(nextTrackId);
			if (nextTrack) {
				if (
					audioEngineRef.current &&
					crossfadeDuration > 0 &&
					playerState.isPlaying
				) {
					await audioEngineRef.current.crossfadeToNext(
						crossfadeDuration
					);
					playerActions.playNext();
				} else {
					playerActions.playNext();
					await playTrack(nextTrack);
				}
			}
		}
	}, [
		playerState.queue,
		playerState.queueIndex,
		playerState.isPlaying,
		tracks,
		crossfadeDuration,
		playTrack,
		playerActions,
	]);

	const playPrevious = useCallback(async () => {
		if (currentTime > 3) {
			seek(0);
			return;
		}

		const prevIndex = playerState.queueIndex - 1;
		if (prevIndex >= 0) {
			const prevTrackId = playerState.queue[prevIndex];
			const prevTrack = tracks.get(prevTrackId);
			if (prevTrack) {
				playerActions.playPrevious();
				await playTrack(prevTrack);
			}
		}
	}, [
		currentTime,
		playerState.queue,
		playerState.queueIndex,
		tracks,
		seek,
		playTrack,
		playerActions,
	]);

	const togglePlayPause = useCallback(async () => {
		if (playerState.isPlaying) {
			pause();
		} else {
			await play();
		}
	}, [playerState.isPlaying, play, pause]);

	const contextValue: AudioContextValue = {
		isInitialized,
		isLoading,
		error,
		currentTime,
		duration,
		volume,
		playbackRate,
		visualizerData,
		equalizerGains,

		playTrack,
		play,
		pause,
		stop,
		seek,
		setVolume: setVolumeHandler,
		setPlaybackRate: setPlaybackRateHandler,
		setEqualizerGain,
		resetEqualizer,
		applyEqualizerPreset,
		playNext,
		playPrevious,
		togglePlayPause,
	};

	return (
		<AudioContext.Provider value={contextValue}>
			{children}
		</AudioContext.Provider>
	);
}
