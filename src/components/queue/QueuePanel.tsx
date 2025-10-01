import { useCallback } from "react";
import { Button } from "@components/shadcn/button";
import { ScrollArea } from "@components/shadcn/scroll-area";
import {
	PlayIcon,
	PauseIcon,
	XIcon,
	TrashIcon,
	FloppyDiskIcon,
} from "@phosphor-icons/react";
import { useQueue, usePlayerStore, useLibraryStore } from "@hooks/useStore";
import { useAudio } from "@services/audio/AudioContext";
import { formatTime } from "@hooks/useAudioHooks";
import { cn } from "@utils/tailwind";
import type { Track } from "@types";

interface QueuePanelProps {
	onClose?: () => void;
	onSaveAsPlaylist?: (tracks: Track[]) => void;
}

export function QueuePanel({ onClose, onSaveAsPlaylist }: QueuePanelProps) {
	const queue = useQueue();
	const {
		queueIndex,
		currentTrackId,
		isPlaying,
		actions: playerActions,
	} = usePlayerStore();
	const { tracks } = useLibraryStore();
	const audio = useAudio();

	const handleTrackClick = useCallback(
		async (track: Track, index: number) => {
			if (currentTrackId === track.id && isPlaying) {
				await audio.pause();
			} else {
				playerActions.setQueue(
					queue.map((t) => t.id),
					index
				);
				await audio.playTrack(track);
			}
		},
		[currentTrackId, isPlaying, queue, playerActions, audio]
	);

	const handleRemoveTrack = useCallback(
		(trackId: string) => {
			const newQueue = queue
				.filter((t) => t.id !== trackId)
				.map((t) => t.id);
			const newIndex =
				queueIndex >= newQueue.length
					? newQueue.length - 1
					: queueIndex;
			playerActions.setQueue(newQueue, newIndex);
		},
		[queue, queueIndex, playerActions]
	);

	const handleClearQueue = useCallback(() => {
		playerActions.setQueue([], -1);
		audio.stop();
	}, [playerActions, audio]);

	const handleSavePlaylist = useCallback(() => {
		if (onSaveAsPlaylist && queue.length > 0) {
			onSaveAsPlaylist(queue);
		}
	}, [queue, onSaveAsPlaylist]);

	const upNext = queue.slice(queueIndex + 1);
	const previousTracks = queue.slice(0, queueIndex);

	return (
		<div className="flex h-full flex-col bg-background">
			{/* Header */}
			<div className="flex items-center justify-between border-b p-4">
				<div>
					<h2 className="text-lg font-semibold">Queue</h2>
					<p className="text-sm text-muted-foreground">
						{queue.length} track{queue.length !== 1 ? "s" : ""}
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={handleSavePlaylist}
						disabled={queue.length === 0}
					>
						<FloppyDiskIcon className="h-4 w-4 mr-2" />
						Save as Playlist
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={handleClearQueue}
						disabled={queue.length === 0}
					>
						<TrashIcon className="h-4 w-4 mr-2" />
						Clear
					</Button>
					{onClose && (
						<Button variant="ghost" size="icon" onClick={onClose}>
							<XIcon className="h-4 w-4" />
						</Button>
					)}
				</div>
			</div>

			{/* Queue Content */}
			<ScrollArea className="flex-1">
				<div className="p-4 space-y-6">
					{/* Now Playing */}
					{queueIndex >= 0 && queueIndex < queue.length && (
						<div>
							<h3 className="mb-3 text-sm font-semibold text-muted-foreground">
								Now Playing
							</h3>
							<QueueTrackItem
								track={queue[queueIndex]}
								isPlaying={isPlaying}
								isCurrent={true}
								onClick={() =>
									handleTrackClick(
										queue[queueIndex],
										queueIndex
									)
								}
								onRemove={() =>
									handleRemoveTrack(queue[queueIndex].id)
								}
							/>
						</div>
					)}

					{/* Up Next */}
					{upNext.length > 0 && (
						<div>
							<h3 className="mb-3 text-sm font-semibold text-muted-foreground">
								Up Next ({upNext.length})
							</h3>
							<div className="space-y-1">
								{upNext.map((track, idx) => (
									<QueueTrackItem
										key={`next-${track.id}-${idx}`}
										track={track}
										isPlaying={false}
										isCurrent={false}
										onClick={() =>
											handleTrackClick(
												track,
												queueIndex + 1 + idx
											)
										}
										onRemove={() =>
											handleRemoveTrack(track.id)
										}
									/>
								))}
							</div>
						</div>
					)}

					{/* Previously Played */}
					{previousTracks.length > 0 && (
						<div>
							<h3 className="mb-3 text-sm font-semibold text-muted-foreground">
								Previously Played ({previousTracks.length})
							</h3>
							<div className="space-y-1 opacity-60">
								{previousTracks.map((track, idx) => (
									<QueueTrackItem
										key={`prev-${track.id}-${idx}`}
										track={track}
										isPlaying={false}
										isCurrent={false}
										onClick={() =>
											handleTrackClick(track, idx)
										}
										onRemove={() =>
											handleRemoveTrack(track.id)
										}
									/>
								))}
							</div>
						</div>
					)}

					{queue.length === 0 && (
						<div className="flex h-64 items-center justify-center text-center text-muted-foreground">
							<div>
								<p className="text-lg font-medium mb-2">
									Queue is empty
								</p>
								<p className="text-sm">
									Play a track or album to see it here
								</p>
							</div>
						</div>
					)}
				</div>
			</ScrollArea>
		</div>
	);
}

interface QueueTrackItemProps {
	track: Track;
	isPlaying: boolean;
	isCurrent: boolean;
	onClick: () => void;
	onRemove: () => void;
}

function QueueTrackItem({
	track,
	isPlaying,
	isCurrent,
	onClick,
	onRemove,
}: QueueTrackItemProps) {
	return (
		<div
			className={cn(
				"group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent cursor-pointer",
				isCurrent && "bg-accent"
			)}
			onClick={onClick}
		>
			{/* Play/Pause Button */}
			<Button
				size="icon"
				variant="ghost"
				className="h-8 w-8 shrink-0"
				onClick={(e) => {
					e.stopPropagation();
					onClick();
				}}
			>
				{isPlaying && isCurrent ? (
					<PauseIcon className="h-4 w-4" />
				) : (
					<PlayIcon className="h-4 w-4" />
				)}
			</Button>

			{/* Artwork */}
			{track.artwork && (
				<img
					src={track.artwork}
					alt={track.album}
					className="h-10 w-10 rounded object-cover shrink-0"
				/>
			)}

			{/* Track Info */}
			<div className="min-w-0 flex-1">
				<p
					className={cn(
						"truncate text-sm font-medium",
						isCurrent && "text-primary"
					)}
				>
					{track.title}
				</p>
				<p className="truncate text-xs text-muted-foreground">
					{track.artist}
				</p>
			</div>

			{/* Duration */}
			<span className="text-sm text-muted-foreground shrink-0">
				{formatTime(track.duration)}
			</span>

			{/* Remove Button */}
			<Button
				size="icon"
				variant="ghost"
				className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100"
				onClick={(e) => {
					e.stopPropagation();
					onRemove();
				}}
			>
				<XIcon className="h-4 w-4" />
			</Button>
		</div>
	);
}
