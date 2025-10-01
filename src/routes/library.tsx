import { useState, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useLibraryStore, usePlayerStore } from "@hooks/useStore";
import { useAudio } from "@services/audio/AudioContext";
import { TrackList } from "@components/library/TrackList";
import { AlbumGrid } from "@components/library/AlbumGrid";
import { LibraryScanner } from "@components/scanner/LibraryScanner";
import { ToggleGroup, ToggleGroupItem } from "@components/shadcn/toggle-group";
import { ListIcon, GridFourIcon } from "@phosphor-icons/react";
import type { Track, Album } from "@types";

type ViewMode = "tracks" | "albums" | "artists";
type SortColumn = keyof Track;

function LibraryPage() {
	const [viewMode, setViewMode] = useState<ViewMode>("albums");
	const [sortBy, setSortBy] = useState<SortColumn>("title");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

	const {
		tracksArray,
		albumsArray,
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

	const handleTrackPlay = useCallback(
		async (track: Track) => {
			playerActions.setQueue(
				tracksArray.map((t) => t.id),
				tracksArray.findIndex((t) => t.id === track.id)
			);
			await audio.playTrack(track);
		},
		[tracksArray, playerActions, audio]
	);

	const handleTrackPause = useCallback(async () => {
		await audio.pause();
	}, [audio]);

	const handleAlbumClick = useCallback((album: Album) => {
		// Switch to tracks view and filter by album
		setViewMode("tracks");
		// TODO: Implement album filtering
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

	const handleScanComplete = useCallback((trackCount: number) => {
		console.log(`Scan complete: ${trackCount} tracks added`);
	}, []);

	return (
		<div className="flex h-full flex-col">
			{/* Header */}
			<div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="flex items-center justify-between p-6">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">
							Music Library
						</h1>
						<p className="text-sm text-muted-foreground mt-1">
							{tracksArray.length} tracks • {albumsArray.length}{" "}
							albums
						</p>
					</div>

					<div className="flex items-center gap-4">
						<LibraryScanner onScanComplete={handleScanComplete} />

						<ToggleGroup
							type="single"
							value={viewMode}
							onValueChange={(value) => {
								if (value) setViewMode(value as ViewMode);
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
				</div>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-hidden">
				{tracksArray.length === 0 ? (
					<div className="flex h-full items-center justify-center">
						<div className="text-center space-y-4">
							<div className="text-6xl">🎵</div>
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
							<TrackList
								tracks={tracksArray}
								currentTrackId={currentTrackId}
								isPlaying={isPlaying}
								onTrackPlay={handleTrackPlay}
								onTrackPause={handleTrackPause}
								sortBy={sortBy}
								sortOrder={sortOrder}
								onSortChange={handleSortChange}
							/>
						)}

						{viewMode === "albums" && (
							<AlbumGrid
								albums={albumsArray}
								onAlbumClick={handleAlbumClick}
								onAlbumPlay={handleAlbumPlay}
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
