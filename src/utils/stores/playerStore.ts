import { Store } from "@tanstack/store";
import { PlaybackState } from "@types";
import { RepeatMode, ShuffleMode } from "@enums";

export const playerStore = new Store<PlaybackState>({
	isPlaying: false,
	currentTrackId: null,
	currentTime: 0,
	duration: 0,
	volume: 1,
	repeatMode: RepeatMode.OFF,
	shuffleMode: ShuffleMode.OFF,
	queue: [],
	queueIndex: -1,
	history: [],
});

export const playerActions = {
	play: () =>
		playerStore.setState((state) => ({ ...state, isPlaying: true })),

	pause: () =>
		playerStore.setState((state) => ({ ...state, isPlaying: false })),

	setCurrentTrack: (trackId: string, duration: number) =>
		playerStore.setState((state) => ({
			...state,
			currentTrackId: trackId,
			duration,
			currentTime: 0,
		})),

	updateTime: (time: number) =>
		playerStore.setState((state) => ({ ...state, currentTime: time })),

	setVolume: (volume: number) =>
		playerStore.setState((state) => ({
			...state,
			volume: Math.max(0, Math.min(1, volume)),
		})),

	toggleRepeatMode: () =>
		playerStore.setState((state) => {
			const modes = [RepeatMode.OFF, RepeatMode.ALL, RepeatMode.ONE];
			const currentIndex = modes.indexOf(state.repeatMode);
			const nextIndex = (currentIndex + 1) % modes.length;
			return { ...state, repeatMode: modes[nextIndex] };
		}),

	toggleShuffle: () =>
		playerStore.setState((state) => ({
			...state,
			shuffleMode:
				state.shuffleMode === ShuffleMode.OFF
					? ShuffleMode.ON
					: ShuffleMode.OFF,
		})),

	setQueue: (queue: string[], startIndex: number = 0) =>
		playerStore.setState((state) => ({
			...state,
			queue,
			queueIndex: startIndex,
			currentTrackId: queue[startIndex] || null,
			history: [],
		})),

	addToQueue: (trackId: string) =>
		playerStore.setState((state) => ({
			...state,
			queue: [...state.queue, trackId],
		})),

	playNext: () =>
		playerStore.setState((state) => {
			if (state.repeatMode === RepeatMode.ONE) {
				return { ...state, currentTime: 0 };
			}

			const nextIndex = state.queueIndex + 1;

			if (nextIndex < state.queue.length) {
				return {
					...state,
					queueIndex: nextIndex,
					currentTrackId: state.queue[nextIndex],
					currentTime: 0,
					history: [...state.history, state.currentTrackId!].filter(
						Boolean
					),
				};
			}

			if (state.repeatMode === RepeatMode.ALL) {
				return {
					...state,
					queueIndex: 0,
					currentTrackId: state.queue[0],
					currentTime: 0,
					history: [...state.history, state.currentTrackId!].filter(
						Boolean
					),
				};
			}

			return { ...state, isPlaying: false };
		}),

	playPrevious: () =>
		playerStore.setState((state) => {
			if (state.currentTime > 3) {
				return { ...state, currentTime: 0 };
			}

			const prevIndex = state.queueIndex - 1;

			if (prevIndex >= 0) {
				return {
					...state,
					queueIndex: prevIndex,
					currentTrackId: state.queue[prevIndex],
					currentTime: 0,
				};
			}

			if (state.repeatMode === RepeatMode.ALL) {
				const lastIndex = state.queue.length - 1;
				return {
					...state,
					queueIndex: lastIndex,
					currentTrackId: state.queue[lastIndex],
					currentTime: 0,
				};
			}

			return { ...state, currentTime: 0 };
		}),
};
