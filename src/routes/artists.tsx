import { useState, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useLibraryStore, usePlayerStore } from "@hooks/useStore";
import { useAudio } from "@services/audio/AudioContext";
import { ArtistGrid } from "@components/artist/ArtistGrid";
import { TrackList } from "@components/library/TrackList";
import { AlbumGrid } from "@components/library/AlbumGrid";
import { ArtistAvatar } from "@components/artist/ArtistAvatar";
import { Button } from "@components/shadcn/button";
import { UserIcon, ArrowLeftIcon, PlayIcon } from "@phosphor-icons/react";
import { Artist, Track, SortColumn, Album } from "@types";

function ArtistsPage() {
	const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
	const [sortBy, setSortBy] = useState<SortColumn>("title");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
	const [viewMode, setViewMode] = useState<"albums" | "tracks">("albums");

	const {
		artistsArray,
		tracksArray,
		actions: libraryActions,
	} = useLibraryStore();
	const {
		isPlaying,
		currentTrackId,
		actions: playerActions,
	} = usePlayerStore();
	const audio = useAudio();

	const handleSortChange = useCallback((column: SortColumn) => {
		setSortBy((prev) => {
			if (prev === column) {
				setSortOrder((order) => (order === "asc" ? "desc" : "asc"));
			} else {
				setSortOrder("asc");
			}
			return column;
		});
	}, []);

	const handleArtistClick = useCallback((artist: Artist) => {
		setSelectedArtist(artist);
	}, []);

	const handleArtistPlay = useCallback(
		async (artist: Artist) => {
			const artistTracks = artist.albums.flatMap((album) => album.tracks);

			if (artistTracks.length > 0) {
				const trackIds = artistTracks.map((t) => t.id);
				playerActions.setQueue(trackIds, 0);
				await audio.playTrack(artistTracks[0]);
			}
		},
		[playerActions, audio]
	);

	const handleTrackPlay = useCallback(
		async (track: Track) => {
			if (!selectedArtist) return;

			const artistTracks = selectedArtist.albums.flatMap(
				(album) => album.tracks
			);
			const trackIds = artistTracks.map((t) => t.id);
			const trackIndex = artistTracks.findIndex((t) => t.id === track.id);

			playerActions.setQueue(trackIds, trackIndex);
			await audio.playTrack(track);
		},
		[selectedArtist, playerActions, audio]
	);

	const handleTrackPause = useCallback(async () => {
		await audio.pause();
	}, [audio]);

	const handleAlbumClick = useCallback((album: Album) => {
		setViewMode("tracks");
	}, []);

	const handleAlbumPlay = useCallback(
		async (album: Album) => {
			if (album.tracks.length > 0) {
				const trackIds = album.tracks.map((t) => t.id);
				playerActions.setQueue(trackIds, 0);
				await audio.playTrack(album.tracks[0]);
			}
		},
		[playerActions, audio]
	);

	const handleBack = useCallback(() => {
		setSelectedArtist(null);
		setViewMode("albums");
	}, []);

	const artistFavouriteTracks = selectedArtist
		? tracksArray.filter(
				(track) =>
					track.artist === selectedArtist.name && track.isFavourite
			)
		: [];

	const artistAllTracks = selectedArtist
		? selectedArtist.albums.flatMap((album) => album.tracks)
		: [];

	return (
		<div className="flex h-full flex-col">
			{selectedArtist ? (
				<>
					<div className="border-b p-6 bg-gradient-to-b from-primary/10 to-background">
						<Button
							variant="ghost"
							size="sm"
							onClick={handleBack}
							className="mb-4"
						>
							<ArrowLeftIcon className="h-4 w-4 mr-2" />
							Back to Artists
						</Button>

						<div className="flex items-center gap-6">
							<ArtistAvatar
								artistName={selectedArtist.name}
								size="lg"
							/>
							<div>
								<p className="text-sm text-muted-foreground mb-1">
									Artist
								</p>
								<h1 className="text-4xl font-bold tracking-tight mb-2">
									{selectedArtist.name}
								</h1>
								<p className="text-sm text-muted-foreground">
									{selectedArtist.albums.length} album
									{selectedArtist.albums.length !== 1
										? "s"
										: ""}{" "}
									• {artistAllTracks.length} track
									{artistAllTracks.length !== 1 ? "s" : ""}
									{artistFavouriteTracks.length > 0 &&
										` • ${artistFavouriteTracks.length} favourite${artistFavouriteTracks.length !== 1 ? "s" : ""}`}
								</p>
								<div className="mt-4">
									<Button
										onClick={() =>
											handleArtistPlay(selectedArtist)
										}
										size="lg"
									>
										<PlayIcon className="h-5 w-5 mr-2" />
										Play All
									</Button>
								</div>
							</div>
						</div>
					</div>

					<div className="flex-1 overflow-y-auto">
						{viewMode === "albums" && (
							<div>
								<div className="p-6 pb-2">
									<h2 className="text-xl font-semibold">
										Albums
									</h2>
								</div>
								<AlbumGrid
									albums={selectedArtist.albums}
									onAlbumClick={handleAlbumClick}
									onAlbumPlay={handleAlbumPlay}
								/>

								{artistFavouriteTracks.length > 0 && (
									<>
										<div className="p-6 pb-2">
											<h2 className="text-xl font-semibold">
												Favourite Tracks
											</h2>
										</div>
										<TrackList
											tracks={artistFavouriteTracks}
											currentTrackId={currentTrackId}
											isPlaying={isPlaying}
											onTrackPlay={handleTrackPlay}
											onTrackPause={handleTrackPause}
											sortBy={sortBy}
											sortOrder={sortOrder}
											onSortChange={handleSortChange}
										/>
									</>
								)}
							</div>
						)}

						{viewMode === "tracks" && (
							<>
								<div className="p-6 pb-2">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => setViewMode("albums")}
									>
										<ArrowLeftIcon className="h-4 w-4 mr-2" />
										Back to Albums
									</Button>
									<h2 className="text-xl font-semibold mt-4">
										All Tracks
									</h2>
								</div>
								<TrackList
									tracks={artistAllTracks}
									currentTrackId={currentTrackId}
									isPlaying={isPlaying}
									onTrackPlay={handleTrackPlay}
									onTrackPause={handleTrackPause}
									sortBy={sortBy}
									sortOrder={sortOrder}
									onSortChange={handleSortChange}
								/>
							</>
						)}
					</div>
				</>
			) : (
				<>
					<div className="border-b p-6">
						<h1 className="text-3xl font-bold tracking-tight">
							Artists
						</h1>
						<p className="text-sm text-muted-foreground mt-1">
							{artistsArray.length} artist
							{artistsArray.length !== 1 ? "s" : ""}
						</p>
					</div>

					<div className="flex-1 overflow-y-auto">
						{artistsArray.length === 0 ? (
							<div className="flex h-full items-center justify-center">
								<div className="text-center">
									<UserIcon className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
									<p className="text-lg font-medium text-muted-foreground">
										No artists in your library
									</p>
								</div>
							</div>
						) : (
							<ArtistGrid
								artists={artistsArray}
								onArtistClick={handleArtistClick}
								onArtistPlay={handleArtistPlay}
							/>
						)}
					</div>
				</>
			)}
		</div>
	);
}

export const Route = createFileRoute("/artists")({
	component: ArtistsPage,
});
