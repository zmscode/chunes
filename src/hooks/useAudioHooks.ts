import { useEffect, useState, useCallback, useMemo } from "react";
import { useAudio } from "@services/audio/AudioContext";
import { usePlayerStore, useCurrentTrack, useQueue } from "@hooks/useStore";

export function useAudioControls() {
	const audio = useAudio();
	const { isPlaying } = usePlayerStore();

	return {
		isPlaying,
		play: audio.play,
		pause: audio.pause,
		stop: audio.stop,
		togglePlayPause: audio.togglePlayPause,
		playNext: audio.playNext,
		playPrevious: audio.playPrevious,
	};
}

export function useAudioSeek() {
	const audio = useAudio();
	const { currentTime, duration } = audio;

	const progress = useMemo(() => {
		if (!duration || duration === 0) return 0;
		return (currentTime / duration) * 100;
	}, [currentTime, duration]);

	const formattedTime = useMemo(() => {
		return formatTime(currentTime);
	}, [currentTime]);

	const formattedDuration = useMemo(() => {
		return formatTime(duration);
	}, [duration]);

	const remainingTime = useMemo(() => {
		return formatTime(duration - currentTime);
	}, [currentTime, duration]);

	return {
		currentTime,
		duration,
		progress,
		formattedTime,
		formattedDuration,
		remainingTime,
		seek: audio.seek,
	};
}

export function useAudioVolume() {
	const audio = useAudio();
	const [isMuted, setIsMuted] = useState(false);
	const [previousVolume, setPreviousVolume] = useState(1);

	const toggleMute = useCallback(() => {
		if (isMuted) {
			audio.setVolume(previousVolume);
			setIsMuted(false);
		} else {
			setPreviousVolume(audio.volume);
			audio.setVolume(0);
			setIsMuted(true);
		}
	}, [isMuted, previousVolume, audio]);

	const setVolume = useCallback(
		(volume: number) => {
			audio.setVolume(volume);
			if (volume > 0 && isMuted) {
				setIsMuted(false);
			} else if (volume === 0) {
				setIsMuted(true);
			}
		},
		[audio, isMuted]
	);

	return {
		volume: audio.volume,
		isMuted,
		setVolume,
		toggleMute,
	};
}

export function useEqualizer() {
	const audio = useAudio();

	const bands = useMemo(
		() => [
			{ frequency: 60, label: "Bass", gain: audio.equalizerGains[0] },
			{ frequency: 170, label: "Low", gain: audio.equalizerGains[1] },
			{ frequency: 350, label: "Mid-Low", gain: audio.equalizerGains[2] },
			{ frequency: 1000, label: "Mid", gain: audio.equalizerGains[3] },
			{
				frequency: 3500,
				label: "Mid-High",
				gain: audio.equalizerGains[4],
			},
			{
				frequency: 10000,
				label: "Treble",
				gain: audio.equalizerGains[5],
			},
		],
		[audio.equalizerGains]
	);

	return {
		bands,
		gains: audio.equalizerGains,
		setGain: audio.setEqualizerGain,
		reset: audio.resetEqualizer,
		applyPreset: audio.applyEqualizerPreset,
	};
}

export function useVisualizer(enabled: boolean = true) {
	const audio = useAudio();
	const [animationFrame, setAnimationFrame] = useState(0);

	useEffect(() => {
		if (!enabled || !audio.visualizerData) return;

		let rafId: number;

		const animate = () => {
			setAnimationFrame((prev) => prev + 1);
			rafId = requestAnimationFrame(animate);
		};

		rafId = requestAnimationFrame(animate);

		return () => {
			if (rafId) {
				cancelAnimationFrame(rafId);
			}
		};
	}, [enabled, audio.visualizerData]);

	return {
		data: audio.visualizerData,
		animationFrame,
	};
}

export function usePlaybackRate() {
	const audio = useAudio();

	const rates = useMemo(
		() => [
			{ value: 0.5, label: "0.5x" },
			{ value: 0.75, label: "0.75x" },
			{ value: 1, label: "1x" },
			{ value: 1.25, label: "1.25x" },
			{ value: 1.5, label: "1.5x" },
			{ value: 2, label: "2x" },
		],
		[]
	);

	return {
		rate: audio.playbackRate,
		rates,
		setRate: audio.setPlaybackRate,
	};
}

export function useAudioKeyboardShortcuts(enabled: boolean = true) {
	const controls = useAudioControls();
	const seek = useAudioSeek();
	const volume = useAudioVolume();

	useEffect(() => {
		if (!enabled) return;

		const handleKeyPress = (e: KeyboardEvent) => {
			if (
				e.target instanceof HTMLInputElement ||
				e.target instanceof HTMLTextAreaElement
			) {
				return;
			}

			switch (e.key.toLowerCase()) {
				case " ":
					e.preventDefault();
					controls.togglePlayPause();
					break;
				case "arrowleft":
					e.preventDefault();
					if (e.shiftKey) {
						controls.playPrevious();
					} else {
						seek.seek(Math.max(0, seek.currentTime - 10));
					}
					break;
				case "arrowright":
					e.preventDefault();
					if (e.shiftKey) {
						controls.playNext();
					} else {
						seek.seek(
							Math.min(seek.duration, seek.currentTime + 10)
						);
					}
					break;
				case "arrowup":
					e.preventDefault();
					volume.setVolume(Math.min(1, volume.volume + 0.05));
					break;
				case "arrowdown":
					e.preventDefault();
					volume.setVolume(Math.max(0, volume.volume - 0.05));
					break;
				case "m":
					e.preventDefault();
					volume.toggleMute();
					break;
			}
		};

		window.addEventListener("keydown", handleKeyPress);

		return () => {
			window.removeEventListener("keydown", handleKeyPress);
		};
	}, [enabled, controls, seek, volume]);
}

/**
 * Hook for current track info
 */
export function useCurrentTrackInfo() {
	const currentTrack = useCurrentTrack();
	const queue = useQueue();
	const { queueIndex } = usePlayerStore();

	return {
		track: currentTrack,
		queuePosition: queueIndex + 1,
		queueLength: queue.length,
		hasNext: queueIndex < queue.length - 1,
		hasPrevious: queueIndex > 0,
	};
}

/**
 * Hook for audio loading state
 */
export function useAudioLoadingState() {
	const { isLoading, error, isInitialized } = useAudio();
	const [retryCount, setRetryCount] = useState(0);

	const retry = useCallback(() => {
		setRetryCount((prev) => prev + 1);
	}, []);

	return {
		isLoading,
		error,
		isInitialized,
		retryCount,
		retry,
	};
}

function formatTime(seconds: number): string {
	if (!seconds || !isFinite(seconds)) return "0:00";

	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = Math.floor(seconds % 60);

	if (hours > 0) {
		return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
	}

	return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export { formatTime };
