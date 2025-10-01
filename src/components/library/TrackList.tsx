import { useRef, useMemo, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Button } from "@components/shadcn/button";
import { PlayIcon, PauseIcon, DotsThreeIcon } from "@phosphor-icons/react";
import { formatTime } from "@hooks/useAudioHooks";
import { cn } from "@utils/tailwind";
import type { Track } from "@types";

interface TrackListProps {
	tracks: Track[];
	currentTrackId: string | null;
	isPlaying: boolean;
	onTrackPlay: (track: Track) => void;
	onTrackPause: () => void;
	sortBy?: keyof Track;
	sortOrder?: "asc" | "desc";
	onSortChange?: (column: keyof Track) => void;
}

type SortableColumn = "title" | "artist" | "album" | "duration";

export function TrackList({
	tracks,
	currentTrackId,
	isPlaying,
	onTrackPlay,
	onTrackPause,
	sortBy = "title",
	sortOrder = "asc",
	onSortChange,
}: TrackListProps) {
	const parentRef = useRef<HTMLDivElement>(null);

	const sortedTracks = useMemo(() => {
		return [...tracks].sort((a, b) => {
			const aVal = a[sortBy];
			const bVal = b[sortBy];

			if (typeof aVal === "string" && typeof bVal === "string") {
				const comparison = aVal.localeCompare(bVal);
				return sortOrder === "asc" ? comparison : -comparison;
			}

			if (typeof aVal === "number" && typeof bVal === "number") {
				const comparison = aVal - bVal;
				return sortOrder === "asc" ? comparison : -comparison;
			}

			return 0;
		});
	}, [tracks, sortBy, sortOrder]);

	const rowVirtualizer = useVirtualizer({
		count: sortedTracks.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 56,
		overscan: 10,
	});

	const handleColumnClick = useCallback(
		(column: SortableColumn) => {
			if (onSortChange) {
				onSortChange(column);
			}
		},
		[onSortChange]
	);

	const handleTrackClick = useCallback(
		(track: Track) => {
			if (currentTrackId === track.id && isPlaying) {
				onTrackPause();
			} else {
				onTrackPlay(track);
			}
		},
		[currentTrackId, isPlaying, onTrackPlay, onTrackPause]
	);

	return (
		<div className="flex h-full flex-col">
			<div className="grid grid-cols-[48px_2fr_1.5fr_1.5fr_100px_48px] gap-4 border-b px-4 py-3 text-sm font-medium text-muted-foreground">
				<div className="text-center">#</div>
				<button
					onClick={() => handleColumnClick("title")}
					className="text-left hover:text-foreground"
				>
					Title{" "}
					{sortBy === "title" && (sortOrder === "asc" ? "↑" : "↓")}
				</button>
				<button
					onClick={() => handleColumnClick("artist")}
					className="text-left hover:text-foreground"
				>
					Artist{" "}
					{sortBy === "artist" && (sortOrder === "asc" ? "↑" : "↓")}
				</button>
				<button
					onClick={() => handleColumnClick("album")}
					className="text-left hover:text-foreground"
				>
					Album{" "}
					{sortBy === "album" && (sortOrder === "asc" ? "↑" : "↓")}
				</button>
				<button
					onClick={() => handleColumnClick("duration")}
					className="text-right hover:text-foreground"
				>
					Duration{" "}
					{sortBy === "duration" && (sortOrder === "asc" ? "↑" : "↓")}
				</button>
				<div></div>
			</div>

			<div ref={parentRef} className="flex-1 overflow-y-auto">
				<div
					style={{
						height: `${rowVirtualizer.getTotalSize()}px`,
						width: "100%",
						position: "relative",
					}}
				>
					{rowVirtualizer.getVirtualItems().map((virtualRow) => {
						const track = sortedTracks[virtualRow.index];
						const isCurrentTrack = currentTrackId === track.id;
						const isTrackPlaying = isCurrentTrack && isPlaying;

						return (
							<div
								key={virtualRow.key}
								data-index={virtualRow.index}
								style={{
									position: "absolute",
									top: 0,
									left: 0,
									width: "100%",
									height: `${virtualRow.size}px`,
									transform: `translateY(${virtualRow.start}px)`,
								}}
							>
								<div
									className={cn(
										"grid grid-cols-[48px_2fr_1.5fr_1.5fr_100px_48px] gap-4 px-4 py-3 transition-colors",
										"hover:bg-accent/50 cursor-pointer group",
										isCurrentTrack && "bg-accent"
									)}
									onClick={() => handleTrackClick(track)}
								>
									<div className="flex items-center justify-center">
										<Button
											size="icon"
											variant="ghost"
											className={cn(
												"h-8 w-8",
												!isCurrentTrack &&
													"opacity-0 group-hover:opacity-100"
											)}
										>
											{isTrackPlaying ? (
												<PauseIcon className="h-4 w-4" />
											) : (
												<PlayIcon className="h-4 w-4" />
											)}
										</Button>
										{!isCurrentTrack && (
											<span className="text-sm text-muted-foreground group-hover:hidden">
												{virtualRow.index + 1}
											</span>
										)}
									</div>

									<div className="flex min-w-0 items-center gap-3">
										{track.artwork && (
											<img
												src={track.artwork}
												alt={track.album}
												className="h-10 w-10 rounded object-cover"
											/>
										)}
										<div className="min-w-0 flex-1">
											<div
												className={cn(
													"truncate text-sm font-medium",
													isCurrentTrack &&
														"text-primary"
												)}
											>
												{track.title}
											</div>
										</div>
									</div>

									<div className="flex items-center">
										<span className="truncate text-sm text-muted-foreground">
											{track.artist}
										</span>
									</div>

									<div className="flex items-center">
										<span className="truncate text-sm text-muted-foreground">
											{track.album}
										</span>
									</div>

									<div className="flex items-center justify-end">
										<span className="text-sm text-muted-foreground">
											{formatTime(track.duration)}
										</span>
									</div>

									<div className="flex items-center justify-center">
										<Button
											size="icon"
											variant="ghost"
											className="h-8 w-8 opacity-0 group-hover:opacity-100"
											onClick={(e) => {
												e.stopPropagation();
											}}
										>
											<DotsThreeIcon className="h-4 w-4" />
										</Button>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			<div className="border-t px-4 py-2 text-sm text-muted-foreground">
				{tracks.length} tracks
			</div>
		</div>
	);
}
