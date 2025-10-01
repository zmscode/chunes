import { createFileRoute } from "@tanstack/react-router";
import { useRecentlyPlayed, usePlayerStore } from "@hooks/useStore";
import { useAudio } from "@services/audio/AudioContext";
import { TrackList } from "@components/library/TrackList";
import { ClockIcon } from "@phosphor-icons/react";

function RecentPage() {
	const recentTracks = useRecentlyPlayed(50);
	const {
		isPlaying,
		currentTrackId,
		actions: playerActions,
	} = usePlayerStore();
	const audio = useAudio();

	const handleTrackPlay = async (track: (typeof recentTracks)[0]) => {
		const trackIds = recentTracks.map((t) => t.id);
		const trackIndex = recentTracks.findIndex((t) => t.id === track.id);
		playerActions.setQueue(trackIds, trackIndex);
		await audio.playTrack(track);
	};

	const handleTrackPause = async () => {
		await audio.pause();
	};

	return (
		<div className="flex h-full flex-col">
			<div className="border-b p-6">
				<h1 className="text-3xl font-bold tracking-tight">
					Recently Played
				</h1>
				<p className="text-sm text-muted-foreground mt-1">
					{recentTracks.length} track
					{recentTracks.length !== 1 ? "s" : ""}
				</p>
			</div>

			<div className="flex-1 overflow-hidden">
				{recentTracks.length === 0 ? (
					<div className="flex h-full items-center justify-center text-center text-muted-foreground">
						<div>
							<ClockIcon className="mx-auto mb-4 h-16 w-16 opacity-50" />
							<p className="text-lg font-medium">
								No recent plays
							</p>
							<p className="text-sm mt-2">
								Tracks you play will appear here
							</p>
						</div>
					</div>
				) : (
					<TrackList
						tracks={recentTracks}
						currentTrackId={currentTrackId}
						isPlaying={isPlaying}
						onTrackPlay={handleTrackPlay}
						onTrackPause={handleTrackPause}
					/>
				)}
			</div>
		</div>
	);
}

export const Route = createFileRoute("/recent")({
	component: RecentPage,
});
