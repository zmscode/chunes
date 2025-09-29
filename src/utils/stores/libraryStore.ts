import { Store } from "@tanstack/store";
import type {
	LibraryState,
	Track,
	Album,
	Artist,
	Playlist,
} from "@utils/types/types";

export const libraryStore = new Store<LibraryState>({
	tracks: new Map(),
	albums: new Map(),
	artists: new Map(),
	playlists: new Map(),
	isScanning: false,
	lastScanDate: null,
});

export const libraryActions = {
	addTrack: (track: Track) =>
		libraryStore.setState((state) => {
			const newTracks = new Map(state.tracks);
			newTracks.set(track.id, track);
			return { ...state, tracks: newTracks };
		}),

	addTracks: (tracks: Track[]) =>
		libraryStore.setState((state) => {
			const newTracks = new Map(state.tracks);
			tracks.forEach((track) => newTracks.set(track.id, track));
			return { ...state, tracks: newTracks };
		}),

	updateTrack: (id: string, updates: Partial<Track>) =>
		libraryStore.setState((state) => {
			const track = state.tracks.get(id);
			if (!track) return state;

			const newTracks = new Map(state.tracks);
			newTracks.set(id, { ...track, ...updates });
			return { ...state, tracks: newTracks };
		}),

	removeTrack: (id: string) =>
		libraryStore.setState((state) => {
			const newTracks = new Map(state.tracks);
			newTracks.delete(id);
			return { ...state, tracks: newTracks };
		}),

	incrementPlayCount: (trackId: string) =>
		libraryStore.setState((state) => {
			const track = state.tracks.get(trackId);
			if (!track) return state;

			const newTracks = new Map(state.tracks);
			newTracks.set(trackId, {
				...track,
				playCount: track.playCount + 1,
				lastPlayed: new Date(),
			});
			return { ...state, tracks: newTracks };
		}),

	setAlbums: (albums: Album[]) =>
		libraryStore.setState((state) => {
			const newAlbums = new Map<string, Album>();
			albums.forEach((album) => newAlbums.set(album.id, album));
			return { ...state, albums: newAlbums };
		}),

	setArtists: (artists: Artist[]) =>
		libraryStore.setState((state) => {
			const newArtists = new Map<string, Artist>();
			artists.forEach((artist) => newArtists.set(artist.id, artist));
			return { ...state, artists: newArtists };
		}),

	addPlaylist: (playlist: Playlist) =>
		libraryStore.setState((state) => {
			const newPlaylists = new Map(state.playlists);
			newPlaylists.set(playlist.id, playlist);
			return { ...state, playlists: newPlaylists };
		}),

	updatePlaylist: (id: string, updates: Partial<Playlist>) =>
		libraryStore.setState((state) => {
			const playlist = state.playlists.get(id);
			if (!playlist) return state;

			const newPlaylists = new Map(state.playlists);
			newPlaylists.set(id, {
				...playlist,
				...updates,
				updatedAt: new Date(),
			});
			return { ...state, playlists: newPlaylists };
		}),

	removePlaylist: (id: string) =>
		libraryStore.setState((state) => {
			const newPlaylists = new Map(state.playlists);
			newPlaylists.delete(id);
			return { ...state, playlists: newPlaylists };
		}),

	addToPlaylist: (playlistId: string, trackId: string) =>
		libraryStore.setState((state) => {
			const playlist = state.playlists.get(playlistId);
			if (!playlist || playlist.tracks.includes(trackId)) return state;

			const newPlaylists = new Map(state.playlists);
			newPlaylists.set(playlistId, {
				...playlist,
				tracks: [...playlist.tracks, trackId],
				updatedAt: new Date(),
			});
			return { ...state, playlists: newPlaylists };
		}),

	removeFromPlaylist: (playlistId: string, trackId: string) =>
		libraryStore.setState((state) => {
			const playlist = state.playlists.get(playlistId);
			if (!playlist) return state;

			const newPlaylists = new Map(state.playlists);
			newPlaylists.set(playlistId, {
				...playlist,
				tracks: playlist.tracks.filter((id) => id !== trackId),
				updatedAt: new Date(),
			});
			return { ...state, playlists: newPlaylists };
		}),

	setScanning: (isScanning: boolean) =>
		libraryStore.setState((state) => ({
			...state,
			isScanning,
			lastScanDate: isScanning ? state.lastScanDate : new Date(),
		})),

	clearLibrary: () =>
		libraryStore.setState(() => ({
			tracks: new Map(),
			albums: new Map(),
			artists: new Map(),
			playlists: new Map(),
			isScanning: false,
			lastScanDate: null,
		})),

	deriveAlbums: () =>
		libraryStore.setState((state) => {
			const albumMap = new Map<string, Album>();

			Array.from(state.tracks.values()).forEach((track) => {
				const albumKey = `${track.albumArtist || track.artist}-${track.album}`;

				if (!albumMap.has(albumKey)) {
					albumMap.set(albumKey, {
						id: albumKey,
						name: track.album,
						artist: track.albumArtist || track.artist,
						artwork: track.artwork,
						year: track.year,
						trackCount: 0,
						tracks: [],
					});
				}

				const album = albumMap.get(albumKey)!;
				album.tracks.push(track);
				album.trackCount++;

				album.tracks.sort((a, b) => {
					const diskA = a.diskNumber || 1;
					const diskB = b.diskNumber || 1;
					if (diskA !== diskB) return diskA - diskB;

					const trackA = a.trackNumber || 0;
					const trackB = b.trackNumber || 0;
					return trackA - trackB;
				});
			});

			return { ...state, albums: albumMap };
		}),

	deriveArtists: () =>
		libraryStore.setState((state) => {
			const artistMap = new Map<string, Artist>();

			Array.from(state.albums.values()).forEach((album) => {
				if (!artistMap.has(album.artist)) {
					artistMap.set(album.artist, {
						id: album.artist,
						name: album.artist,
						albums: [],
						image: undefined,
					});
				}

				const artist = artistMap.get(album.artist)!;
				artist.albums.push(album);

				artist.albums.sort((a, b) => {
					if (!a.year || !b.year) return 0;
					return b.year - a.year;
				});
			});

			return { ...state, artists: artistMap };
		}),
};
