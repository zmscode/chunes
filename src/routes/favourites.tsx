import { useCallback, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { HeartIcon } from "@phosphor-icons/react";
import { useLibraryStore, usePlayerStore } from "@hooks/useStore";
import { useAudio } from "@services/audio/AudioContext";
import { TrackList } from "@components/library/TrackList";
import { Track, SortColumn } from "@types";

function FavouritesPage() {
	const [sortBy, setSortBy] = useState<SortColumn>("title");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

	const { tracksArray } = useLibraryStore();
	const {
		isPlaying,
		currentTrackId,
		actions: playerActions,
	} = usePlayerStore();
	const audio = useAudio();

	const favouriteTracks = tracksArray.filter((track) => track.isFavourite);

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
			const trackIds = favouriteTracks.map((t) => t.id);
			const trackIndex = favouriteTracks.findIndex(
				(t) => t.id === track.id
			);

			playerActions.setQueue(trackIds, trackIndex);
			await audio.playTrack(track);
		},
		[favouriteTracks, playerActions, audio]
	);

	const handleTrackPause = useCallback(async () => {
		await audio.pause();
	}, [audio]);

	return (
		<div className="flex h-full flex-col">
			<div className="border-b p-6">
				<h1 className="text-3xl font-bold tracking-tight">
					Favourites
				</h1>
				<p className="text-sm text-muted-foreground mt-1">
					{favouriteTracks.length > 0
						? `${favouriteTracks.length} track${favouriteTracks.length !== 1 ? "s" : ""}`
						: "Your most loved tracks"}
				</p>
			</div>

			<div className="flex-1 overflow-y-auto">
				{favouriteTracks.length === 0 ? (
					<div className="flex h-full items-center justify-center text-center text-muted-foreground p-6">
						<div>
							<HeartIcon className="mx-auto mb-4 h-16 w-16 opacity-50" />
							<p className="text-lg font-medium">
								No favorites yet
							</p>
							<p className="text-sm mt-2">
								Heart tracks to add them to your favorites
							</p>
						</div>
					</div>
				) : (
					<TrackList
						tracks={favouriteTracks}
						currentTrackId={currentTrackId}
						isPlaying={isPlaying}
						onTrackPlay={handleTrackPlay}
						onTrackPause={handleTrackPause}
						sortBy={sortBy}
						sortOrder={sortOrder}
						onSortChange={handleSortChange}
					/>
				)}
			</div>
		</div>
	);
}

export const Route = createFileRoute("/favourites")({
	component: FavouritesPage,
});
