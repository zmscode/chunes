import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useLibraryStore } from "@hooks/useStore";
import { Input } from "@components/shadcn/input";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { TrackList } from "@components/library/TrackList";
import { AlbumGrid } from "@components/library/AlbumGrid";
import { usePlayerStore } from "@hooks/useStore";
import { useAudio } from "@services/audio/AudioContext";
import type { Track, Album } from "@types";

function SearchPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const { tracksArray, albumsArray, artistsArray } = useLibraryStore();
	const {
		isPlaying,
		currentTrackId,
		actions: playerActions,
	} = usePlayerStore();
	const audio = useAudio();

	const searchResults = useMemo(() => {
		if (!searchQuery.trim()) {
			return {
				tracks: [],
				albums: [],
				artists: [],
			};
		}

		const query = searchQuery.toLowerCase().trim();

		const tracks = tracksArray.filter(
			(track) =>
				track.title.toLowerCase().includes(query) ||
				track.artist.toLowerCase().includes(query) ||
				track.album.toLowerCase().includes(query)
		);

		const albums = albumsArray.filter(
			(album) =>
				album.name.toLowerCase().includes(query) ||
				album.artist.toLowerCase().includes(query)
		);

		const artists = artistsArray.filter((artist) =>
			artist.name.toLowerCase().includes(query)
		);

		return { tracks, albums, artists };
	}, [searchQuery, tracksArray, albumsArray, artistsArray]);

	const handleTrackPlay = async (track: Track) => {
		const trackIds = searchResults.tracks.map((t) => t.id);
		const trackIndex = searchResults.tracks.findIndex(
			(t) => t.id === track.id
		);
		playerActions.setQueue(trackIds, trackIndex);
		await audio.playTrack(track);
	};

	const handleTrackPause = async () => {
		await audio.pause();
	};

	const handleAlbumClick = (album: Album) => {
		console.log("Album clicked:", album);
	};

	const handleAlbumPlay = async (album: Album) => {
		if (album.tracks.length > 0) {
			const trackIds = album.tracks.map((t) => t.id);
			playerActions.setQueue(trackIds, 0);
			await audio.playTrack(album.tracks[0]);
		}
	};

	const hasResults =
		searchResults.tracks.length > 0 ||
		searchResults.albums.length > 0 ||
		searchResults.artists.length > 0;

	return (
		<div className="flex h-full flex-col">
			{/* Search Header */}
			<div className="border-b p-6">
				<div className="mx-auto max-w-2xl">
					<h1 className="text-3xl font-bold tracking-tight mb-4">
						Search
					</h1>
					<div className="relative">
						<MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
						<Input
							type="search"
							placeholder="Search for tracks, albums, or artists..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10 h-12 text-base"
						/>
					</div>
				</div>
			</div>

			{/* Search Results */}
			<div className="flex-1 overflow-y-auto">
				{!searchQuery.trim() && (
					<div className="flex h-full items-center justify-center text-center text-muted-foreground">
						<div>
							<MagnifyingGlassIcon className="mx-auto mb-4 h-16 w-16 opacity-50" />
							<p className="text-lg font-medium">
								Start searching
							</p>
							<p className="text-sm mt-2">
								Find your favorite tracks, albums, and artists
							</p>
						</div>
					</div>
				)}

				{searchQuery.trim() && !hasResults && (
					<div className="flex h-full items-center justify-center text-center text-muted-foreground">
						<div>
							<p className="text-lg font-medium">
								No results found
							</p>
							<p className="text-sm mt-2">
								Try searching with different keywords
							</p>
						</div>
					</div>
				)}

				{hasResults && (
					<div className="space-y-8 p-6">
						{/* Tracks */}
						{searchResults.tracks.length > 0 && (
							<section>
								<h2 className="text-xl font-semibold mb-4">
									Tracks ({searchResults.tracks.length})
								</h2>
								<div className="rounded-lg border overflow-hidden">
									<TrackList
										tracks={searchResults.tracks.slice(
											0,
											20
										)}
										currentTrackId={currentTrackId}
										isPlaying={isPlaying}
										onTrackPlay={handleTrackPlay}
										onTrackPause={handleTrackPause}
									/>
								</div>
							</section>
						)}

						{/* Albums */}
						{searchResults.albums.length > 0 && (
							<section>
								<h2 className="text-xl font-semibold mb-4">
									Albums ({searchResults.albums.length})
								</h2>
								<AlbumGrid
									albums={searchResults.albums.slice(0, 12)}
									onAlbumClick={handleAlbumClick}
									onAlbumPlay={handleAlbumPlay}
								/>
							</section>
						)}

						{/* Artists */}
						{searchResults.artists.length > 0 && (
							<section>
								<h2 className="text-xl font-semibold mb-4">
									Artists ({searchResults.artists.length})
								</h2>
								<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
									{searchResults.artists
										.slice(0, 10)
										.map((artist) => (
											<div
												key={artist.id}
												className="cursor-pointer rounded-lg border p-4 transition-all hover:bg-accent"
											>
												<p className="font-medium truncate">
													{artist.name}
												</p>
												<p className="text-sm text-muted-foreground">
													{artist.albums.length} album
													{artist.albums.length !== 1
														? "s"
														: ""}
												</p>
											</div>
										))}
								</div>
							</section>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

export const Route = createFileRoute("/search")({
	component: SearchPage,
});
