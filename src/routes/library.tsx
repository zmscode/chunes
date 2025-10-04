import { useState, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useLibraryStore, usePlayerStore } from "@hooks/useStore";
import { useAudio } from "@services/audio/AudioContext";
import { TrackList } from "@components/library/TrackList";
import { AlbumGrid } from "@components/library/AlbumGrid";
import { LibraryScanner } from "@components/scanner/LibraryScanner";
import { ToggleGroup, ToggleGroupItem } from "@components/shadcn/toggle-group";
import { Button } from "@components/shadcn/button";
import { ListIcon, GridFourIcon, MusicNotesIcon, ArrowLeftIcon } from "@phosphor-icons/react";
import { ViewMode, SortColumn, Track, Album } from "@types";

function LibraryPage() {
	const [viewMode, setViewMode] = useState<ViewMode>("albums");
	const [sortBy, setSortBy] = useState<SortColumn>("title");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
	const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);

	const {
		tracksArray,
		albumsArray,
		actions: libraryActions,
	} = useLibraryStore();

	// Get the current album from the store to ensure it's always up-to-date
	const selectedAlbum = selectedAlbumId
		? albumsArray.find(a => a.id === selectedAlbumId) || null
		: null;
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

	const handleTrackPlay = useCallback(
		async (track: Track) => {
			try {
				const trackIds = tracksArray.map((t) => t.id);
				const trackIndex = tracksArray.findIndex(
					(t) => t.id === track.id
				);

				playerActions.setQueue(trackIds, trackIndex);
				await audio.playTrack(track);
			} catch {}
		},
		[tracksArray, playerActions, audio]
	);

	const handleTrackPause = useCallback(async () => {
		await audio.pause();
	}, [audio]);

	const handleAlbumClick = useCallback((album: Album) => {
		setSelectedAlbumId(album.id);
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

	const handleScanComplete = useCallback((trackCount: number) => {}, []);

	return (
		<div className="flex h-full flex-col">
			<div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="flex items-center justify-between p-6">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">
							Library
						</h1>
						<p className="text-sm text-muted-foreground mt-1">
							{tracksArray.length} tracks • {albumsArray.length}{" "}
							albums
						</p>
					</div>

					{tracksArray.length > 0 && (
						<div className="flex items-center gap-4">
							<LibraryScanner onScanComplete={handleScanComplete} />

							<ToggleGroup
								type="single"
								value={viewMode}
								onValueChange={(value) => {
									if (value) {
										setViewMode(value as ViewMode);
										if (value === "albums") {
											setSelectedAlbumId(null);
										}
									}
								}}
							>
								<ToggleGroupItem
									value="albums"
									aria-label="Grid view"
								>
									<GridFourIcon className="h-4 w-4" />
								</ToggleGroupItem>
								<ToggleGroupItem
									value="tracks"
									aria-label="List view"
								>
									<ListIcon className="h-4 w-4" />
								</ToggleGroupItem>
							</ToggleGroup>
						</div>
					)}
				</div>
			</div>

			<div className="flex-1 overflow-hidden">
				{tracksArray.length === 0 ? (
					<div className="flex h-full items-center justify-center">
						<div className="text-center space-y-4">
							<div className="flex justify-center">
								<MusicNotesIcon className="h-16 w-16 text-muted-foreground opacity-50" />
							</div>
							<div>
								<h2 className="text-2xl font-semibold mb-2">
									No music in your library
								</h2>
								<p className="text-muted-foreground mb-6">
									Get started by adding your music folder
								</p>
								<LibraryScanner
									onScanComplete={handleScanComplete}
								/>
							</div>
						</div>
					</div>
				) : (
					<>
						{viewMode === "tracks" && (
							<>
								<div className="border-b p-6">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => {
											setSelectedAlbumId(null);
											setViewMode("albums");
										}}
										className="mb-4"
									>
										<ArrowLeftIcon className="h-4 w-4 mr-2" />
										Back to Albums
									</Button>
									{selectedAlbum ? (
										<div className="flex items-center gap-4">
											{selectedAlbum.artwork && (
												<img
													src={selectedAlbum.artwork}
													alt={selectedAlbum.name}
													className="h-32 w-32 rounded-lg shadow-md"
												/>
											)}
											<div>
												<p className="text-sm text-muted-foreground mb-1">
													Album
												</p>
												<h1 className="text-3xl font-bold tracking-tight mb-2">
													{selectedAlbum.name}
												</h1>
												<p className="text-sm text-muted-foreground">
													{selectedAlbum.artist} • {selectedAlbum.trackCount} track
													{selectedAlbum.trackCount !== 1 ? "s" : ""}
													{selectedAlbum.year && ` • ${selectedAlbum.year}`}
												</p>
											</div>
										</div>
									) : (
										<div className="flex items-center gap-4">
											<div className="h-32 w-32 rounded-lg shadow-md bg-gradient-to-br from-primary/80 to-primary/40 flex items-center justify-center">
												<MusicNotesIcon className="h-16 w-16 text-white" weight="regular" />
											</div>
											<div>
												<p className="text-sm text-muted-foreground mb-1">
													Library
												</p>
												<h1 className="text-3xl font-bold tracking-tight mb-2">
													All Songs
												</h1>
												<p className="text-sm text-muted-foreground">
													{tracksArray.length} track
													{tracksArray.length !== 1 ? "s" : ""}
												</p>
											</div>
										</div>
									)}
								</div>
								<TrackList
									tracks={
										selectedAlbum
											? selectedAlbum.tracks
											: tracksArray
									}
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

						{viewMode === "albums" && (
							<AlbumGrid
								albums={albumsArray}
								onAlbumClick={handleAlbumClick}
								onAlbumPlay={handleAlbumPlay}
								allTracks={tracksArray}
								onAllTracksClick={() => {
									setSelectedAlbumId(null);
									setViewMode("tracks");
								}}
								onAllTracksPlay={async () => {
									if (tracksArray.length > 0) {
										const trackIds = tracksArray.map(
											(t) => t.id
										);
										playerActions.setQueue(trackIds, 0);
										await audio.playTrack(tracksArray[0]);
									}
								}}
							/>
						)}
					</>
				)}
			</div>
		</div>
	);
}

export const Route = createFileRoute("/library")({
	component: LibraryPage,
});
