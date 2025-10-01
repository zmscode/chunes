// src/components/queue/EnhancedQueuePanel.tsx
import { useCallback, useState } from "react";
import { Button } from "@components/shadcn/button";
import { ScrollArea } from "@components/shadcn/scroll-area";
import { Separator } from "@components/shadcn/separator";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@components/shadcn/sheet";
import {
	PlayIcon,
	PauseIcon,
	XIcon,
	TrashIcon,
	FloppyDiskIcon,
	ListIcon,
	ShuffleIcon,
} from "@phosphor-icons/react";
import { useQueue, usePlayerStore } from "@hooks/useStore";
import { useAudio } from "@services/audio/AudioContext";
import { formatTime } from "@hooks/useAudioHooks";
import { cn } from "@utils/tailwind";
import type { Track } from "@types";

interface QueuePanelProps {
	trigger?: React.ReactNode;
	onSaveAsPlaylist?: (tracks: Track[]) => void;
}

export function QueuePanel({ trigger, onSaveAsPlaylist }: QueuePanelProps) {
	const [open, setOpen] = useState(false);
	const queue = useQueue();
	const {
		queueIndex,
		currentTrackId,
		isPlaying,
		shuffleMode,
		repeatMode,
		actions: playerActions,
	} = usePlayerStore();
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
		(trackId: string, index: number) => {
			const newQueue = queue
				.filter((t) => t.id !== trackId)
				.map((t) => t.id);

			let newIndex = queueIndex;
			if (index < queueIndex) {
				newIndex = queueIndex - 1;
			} else if (index === queueIndex) {
				newIndex = Math.min(queueIndex, newQueue.length - 1);
			}

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
			setOpen(false);
		}
	}, [queue, onSaveAsPlaylist]);

	const toggleShuffle = useCallback(() => {
		playerActions.toggleShuffle();
	}, [playerActions]);

	const toggleRepeat = useCallback(() => {
		playerActions.toggleRepeatMode();
	}, [playerActions]);

	const upNext = queue.slice(queueIndex + 1);
	const previousTracks = queue.slice(0, queueIndex);
	const totalDuration = queue.reduce((sum, track) => sum + track.duration, 0);

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				{trigger || (
					<Button variant="outline" size="sm">
						<ListIcon className="h-4 w-4 mr-2" />
						Queue ({queue.length})
					</Button>
				)}
			</SheetTrigger>
			<SheetContent side="right" className="w-full sm:max-w-lg p-0">
				<SheetHeader className="p-6 pb-4">
					<SheetTitle>Play Queue</SheetTitle>
					<SheetDescription>
						{queue.length} track{queue.length !== 1 ? "s" : ""} •{" "}
						{formatTime(totalDuration)} total
					</SheetDescription>
				</SheetHeader>

				{/* Controls Bar */}
				<div className="flex items-center justify-between px-6 pb-4">
					<div className="flex items-center gap-2">
						<Button
							variant={
								shuffleMode === "on" ? "default" : "outline"
							}
							size="sm"
							onClick={toggleShuffle}
						>
							<ShuffleIcon className="h-4 w-4 mr-2" />
							Shuffle
						</Button>
						<Button
							variant={
								repeatMode !== "off" ? "default" : "outline"
							}
							size="sm"
							onClick={toggleRepeat}
						>
							<ListIcon className="h-4 w-4 mr-2" />
							{repeatMode === "one"
								? "Repeat One"
								: repeatMode === "all"
									? "Repeat All"
									: "Repeat"}
						</Button>
					</div>

					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={handleSavePlaylist}
							disabled={queue.length === 0}
						>
							<FloppyDiskIcon className="h-4 w-4 mr-2" />
							Save
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
					</div>
				</div>

				<Separator />

				{/* Queue Content */}
				<ScrollArea className="flex-1 h-[calc(100vh-180px)]">
					<div className="p-6 space-y-6">
						{queue.length === 0 ? (
							<div className="flex h-64 items-center justify-center text-center text-muted-foreground">
								<div>
									<ListIcon className="mx-auto mb-4 h-16 w-16 opacity-50" />
									<p className="text-lg font-medium mb-2">
										Queue is empty
									</p>
									<p className="text-sm">
										Play a track or album to see it here
									</p>
								</div>
							</div>
						) : (
							<>
								{/* Now Playing */}
								{queueIndex >= 0 &&
									queueIndex < queue.length && (
										<div>
											<h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
												Now Playing
											</h3>
											<QueueTrackItem
												track={queue[queueIndex]}
												index={queueIndex}
												isPlaying={isPlaying}
												isCurrent={true}
												onClick={() =>
													handleTrackClick(
														queue[queueIndex],
														queueIndex
													)
												}
												onRemove={() =>
													handleRemoveTrack(
														queue[queueIndex].id,
														queueIndex
													)
												}
											/>
										</div>
									)}

								{/* Up Next */}
								{upNext.length > 0 && (
									<div>
										<h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
											Up Next • {upNext.length}
										</h3>
										<div className="space-y-1">
											{upNext.map((track, idx) => (
												<QueueTrackItem
													key={`next-${track.id}-${idx}`}
													track={track}
													index={queueIndex + 1 + idx}
													isPlaying={false}
													isCurrent={false}
													onClick={() =>
														handleTrackClick(
															track,
															queueIndex + 1 + idx
														)
													}
													onRemove={() =>
														handleRemoveTrack(
															track.id,
															queueIndex + 1 + idx
														)
													}
												/>
											))}
										</div>
									</div>
								)}

								{/* Previously Played */}
								{previousTracks.length > 0 && (
									<div>
										<h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
											Previously Played •{" "}
											{previousTracks.length}
										</h3>
										<div className="space-y-1 opacity-60">
											{previousTracks.map(
												(track, idx) => (
													<QueueTrackItem
														key={`prev-${track.id}-${idx}`}
														track={track}
														index={idx}
														isPlaying={false}
														isCurrent={false}
														onClick={() =>
															handleTrackClick(
																track,
																idx
															)
														}
														onRemove={() =>
															handleRemoveTrack(
																track.id,
																idx
															)
														}
													/>
												)
											)}
										</div>
									</div>
								)}
							</>
						)}
					</div>
				</ScrollArea>
			</SheetContent>
		</Sheet>
	);
}

interface QueueTrackItemProps {
	track: Track;
	index: number;
	isPlaying: boolean;
	isCurrent: boolean;
	onClick: () => void;
	onRemove: () => void;
}

function QueueTrackItem({
	track,
	index,
	isPlaying,
	isCurrent,
	onClick,
	onRemove,
}: QueueTrackItemProps) {
	return (
		<div
			className={cn(
				"group flex items-center gap-3 rounded-lg p-3 transition-all hover:bg-accent cursor-pointer",
				isCurrent && "bg-accent shadow-sm"
			)}
			onClick={onClick}
		>
			{/* Index/Play Button */}
			<div className="flex items-center justify-center w-8 shrink-0">
				{isCurrent ? (
					<Button
						size="icon"
						variant="ghost"
						className="h-8 w-8"
						onClick={(e) => {
							e.stopPropagation();
							onClick();
						}}
					>
						{isPlaying ? (
							<PauseIcon className="h-4 w-4" />
						) : (
							<PlayIcon className="h-4 w-4" />
						)}
					</Button>
				) : (
					<span className="text-sm text-muted-foreground group-hover:hidden">
						{index + 1}
					</span>
				)}
				{!isCurrent && (
					<Button
						size="icon"
						variant="ghost"
						className="hidden h-8 w-8 group-hover:flex"
						onClick={(e) => {
							e.stopPropagation();
							onClick();
						}}
					>
						<PlayIcon className="h-4 w-4" />
					</Button>
				)}
			</div>

			{/* Artwork */}
			{track.artwork && (
				<div className="shrink-0 overflow-hidden rounded">
					<img
						src={track.artwork}
						alt={track.album}
						className="h-12 w-12 object-cover"
					/>
				</div>
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
					{track.artist} • {track.album}
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
