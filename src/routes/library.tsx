// src/routes/library.tsx - Add debug panel temporarily
import { useState, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useLibraryStore, usePlayerStore } from "@hooks/useStore";
import { useAudio } from "@services/audio/AudioContext";
import { TrackList } from "@components/library/TrackList";
import { AlbumGrid } from "@components/library/AlbumGrid";
import { LibraryScanner } from "@components/scanner/LibraryScanner";
import { AudioDebugPanel } from "@components/debug/AudioDebugPanel";
import { ToggleGroup, ToggleGroupItem } from "@components/shadcn/toggle-group";
import { ListIcon, GridFourIcon, BugIcon } from "@phosphor-icons/react";
import { Button } from "@components/shadcn/button";
import type { Track, Album } from "@types";

type ViewMode = "tracks" | "albums" | "artists";
type SortColumn = keyof Track;

function LibraryPage() {
	const [viewMode, setViewMode] = useState<ViewMode>("albums");
	const [sortBy, setSortBy] = useState<SortColumn>("title");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
	const [showDebug, setShowDebug] = useState(false);

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
			console.log("=== TRACK PLAY CLICKED ===");
			console.log("Track:", track);
			console.log("Current tracks:", tracksArray.length);

			try {
				const trackIds = tracksArray.map((t) => t.id);
				const trackIndex = tracksArray.findIndex(
					(t) => t.id === track.id
				);

				console.log("Setting queue with", trackIds.length, "tracks");
				console.log("Track index:", trackIndex);

				playerActions.setQueue(trackIds, trackIndex);

				console.log("Calling audio.playTrack...");
				await audio.playTrack(track);

				console.log("=== PLAY COMPLETED ===");
			} catch (error) {
				console.error("Error in handleTrackPlay:", error);
			}
		},
		[tracksArray, playerActions, audio]
	);

	const handleTrackPause = useCallback(async () => {
		console.log("Pausing audio...");
		await audio.pause();
	}, [audio]);

	const handleAlbumClick = useCallback((album: Album) => {
		setViewMode("tracks");
		// TODO: Implement album filtering
	}, []);

	const handleAlbumPlay = useCallback(
		async (album: Album) => {
			console.log("=== ALBUM PLAY CLICKED ===");
			console.log("Album:", album);

			if (album.tracks.length > 0) {
				const trackIds = album.tracks.map((t) => t.id);
				console.log("Setting queue with", trackIds.length, "tracks");

				playerActions.setQueue(trackIds, 0);

				console.log("Playing first track:", album.tracks[0]);
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
						<Button
							size="icon"
							variant={showDebug ? "default" : "outline"}
							onClick={() => setShowDebug(!showDebug)}
						>
							<BugIcon className="h-4 w-4" />
						</Button>

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

			{/* Debug Panel */}
			{showDebug && <AudioDebugPanel />}
		</div>
	);
}

export const Route = createFileRoute("/library")({
	component: LibraryPage,
});
