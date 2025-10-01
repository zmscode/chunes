import { useStore } from "@tanstack/react-store";
import { playerStore, playerActions } from "@stores/playerStore";
import { libraryStore, libraryActions } from "@stores/libraryStore";
import { settingsStore, settingsActions } from "@stores/settingsStore";
import { useMemo } from "react";
import { Track, Album, Artist, Playlist } from "@types";

export const usePlayerStore = () => {
	const state = useStore(playerStore);
	return {
		...state,
		actions: playerActions,
	};
};

export const useLibraryStore = () => {
	const state = useStore(libraryStore);

	return useMemo(
		() => ({
			...state,
			actions: libraryActions,

			tracksArray: Array.from(state.tracks.values()),
			albumsArray: Array.from(state.albums.values()),
			artistsArray: Array.from(state.artists.values()),
			playlistsArray: Array.from(state.playlists.values()),
		}),
		[state]
	);
};

export const useSettingsStore = () => {
	const state = useStore(settingsStore);
	return {
		...state,
		actions: settingsActions,
	};
};

export const useCurrentTrack = (): Track | null => {
	const playerState = useStore(playerStore);
	const libraryState = useStore(libraryStore);

	if (!playerState.currentTrackId) return null;
	return libraryState.tracks.get(playerState.currentTrackId) || null;
};

export const useQueue = (): Track[] => {
	const playerState = useStore(playerStore);
	const libraryState = useStore(libraryStore);

	return playerState.queue
		.map((id) => libraryState.tracks.get(id))
		.filter((track): track is Track => track !== undefined);
};

export const useAlbum = (albumId: string): Album | null => {
	const libraryState = useStore(libraryStore);
	return libraryState.albums.get(albumId) || null;
};

export const useArtist = (artistId: string): Artist | null => {
	const libraryState = useStore(libraryStore);
	return libraryState.artists.get(artistId) || null;
};

export const usePlaylist = (playlistId: string): Playlist | null => {
	const libraryState = useStore(libraryStore);
	return libraryState.playlists.get(playlistId) || null;
};

export const usePlaylistTracks = (playlistId: string): Track[] => {
	const libraryState = useStore(libraryStore);
	const playlist = libraryState.playlists.get(playlistId);

	if (!playlist) return [];

	return playlist.tracks
		.map((id) => libraryState.tracks.get(id))
		.filter((track): track is Track => track !== undefined);
};

export const useSearchTracks = (query: string): Track[] => {
	const libraryState = useStore(libraryStore);
	const tracks = Array.from(libraryState.tracks.values());

	if (!query) return tracks;

	const lowerQuery = query.toLowerCase();
	return tracks.filter(
		(track) =>
			track.title.toLowerCase().includes(lowerQuery) ||
			track.artist.toLowerCase().includes(lowerQuery) ||
			track.album.toLowerCase().includes(lowerQuery)
	);
};

export const useRecentlyPlayed = (limit: number = 20): Track[] => {
	const libraryState = useStore(libraryStore);
	const tracks = Array.from(libraryState.tracks.values());

	return tracks
		.filter((track) => track.lastPlayed)
		.sort((a, b) => {
			const dateA = a.lastPlayed?.getTime() || 0;
			const dateB = b.lastPlayed?.getTime() || 0;
			return dateB - dateA;
		})
		.slice(0, limit);
};

export const useMostPlayed = (limit: number = 50): Track[] => {
	const libraryState = useStore(libraryStore);
	const tracks = Array.from(libraryState.tracks.values());

	return tracks
		.filter((track) => track.playCount > 0)
		.sort((a, b) => b.playCount - a.playCount)
		.slice(0, limit);
};

export const useLibraryStats = () => {
	const libraryState = useStore(libraryStore);

	return useMemo(() => {
		const tracks = Array.from(libraryState.tracks.values());
		const totalDuration = tracks.reduce(
			(sum, track) => sum + track.duration,
			0
		);
		const totalPlayCount = tracks.reduce(
			(sum, track) => sum + track.playCount,
			0
		);

		return {
			totalTracks: tracks.length,
			totalAlbums: libraryState.albums.size,
			totalArtists: libraryState.artists.size,
			totalPlaylists: libraryState.playlists.size,
			totalDuration,
			totalPlayCount,
			avgPlayCount:
				tracks.length > 0 ? totalPlayCount / tracks.length : 0,
		};
	}, [libraryState]);
};
