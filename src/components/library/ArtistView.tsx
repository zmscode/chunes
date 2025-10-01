import { useState, useCallback } from "react";
import { Button } from "@components/shadcn/button";
import { ScrollArea } from "@components/shadcn/scroll-area";
import { PlayIcon, ShuffleIcon, MusicNotesIcon } from "@phosphor-icons/react";
import { cn } from "@utils/tailwind";
import { formatTime } from "@hooks/useAudioHooks";
import type { Artist, Album, Track } from "@types";

interface ArtistViewProps {
	artist: Artist;
	onPlayAll: (tracks: Track[]) => void;
	onShuffleAll: (tracks: Track[]) => void;
	onAlbumClick: (album: Album) => void;
	onTrackClick: (track: Track) => void;
}

export function ArtistView({
	artist,
	onPlayAll,
	onShuffleAll,
	onAlbumClick,
	onTrackClick,
}: ArtistViewProps) {
	const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(
		artist.albums[0] || null
	);

	const allTracks = artist.albums.flatMap((album) => album.tracks);

	const handleAlbumSelect = useCallback((album: Album) => {
		setSelectedAlbum(album);
	}, []);

	return (
		<div className="flex h-full flex-col">
			{/* Artist Header */}
			<div className="border-b bg-gradient-to-b from-accent/50 to-background p-8">
				<div className="container mx-auto flex items-end gap-6">
					{/* Artist Image */}
					<div className="h-48 w-48 shrink-0 overflow-hidden rounded-lg bg-muted shadow-xl">
						{artist.image ? (
							<img
								src={artist.image}
								alt={artist.name}
								className="h-full w-full object-cover"
							/>
						) : (
							<div className="flex h-full w-full items-center justify-center">
								<MusicNotesIcon className="h-24 w-24 text-muted-foreground opacity-50" />
							</div>
						)}
					</div>

					{/* Artist Info */}
					<div className="flex-1">
						<p className="text-sm font-medium text-muted-foreground mb-2">
							Artist
						</p>
						<h1 className="text-5xl font-bold mb-4">
							{artist.name}
						</h1>
						<div className="flex items-center gap-4 text-sm text-muted-foreground">
							<span>{artist.albums.length} albums</span>
							<span>•</span>
							<span>{allTracks.length} tracks</span>
						</div>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="container mx-auto mt-6 flex items-center gap-3">
					<Button
						size="lg"
						className="gap-2"
						onClick={() => onPlayAll(allTracks)}
					>
						<PlayIcon className="h-5 w-5" />
						Play All
					</Button>
					<Button
						size="lg"
						variant="outline"
						className="gap-2"
						onClick={() => onShuffleAll(allTracks)}
					>
						<ShuffleIcon className="h-5 w-5" />
						Shuffle
					</Button>
				</div>
			</div>

			{/* Albums and Tracks */}
			<div className="flex flex-1 overflow-hidden">
				{/* Albums Sidebar */}
				<div className="w-80 border-r">
					<ScrollArea className="h-full">
						<div className="p-4">
							<h2 className="mb-3 text-sm font-semibold text-muted-foreground">
								Albums
							</h2>
							<div className="space-y-1">
								{artist.albums.map((album) => (
									<button
										key={album.id}
										onClick={() => handleAlbumSelect(album)}
										className={cn(
											"w-full rounded-lg p-3 text-left transition-colors hover:bg-accent",
											selectedAlbum?.id === album.id &&
												"bg-accent"
										)}
									>
										<div className="flex items-center gap-3">
											{album.artwork && (
												<img
													src={album.artwork}
													alt={album.name}
													className="h-12 w-12 rounded object-cover"
												/>
											)}
											<div className="min-w-0 flex-1">
												<p className="truncate text-sm font-medium">
													{album.name}
												</p>
												<p className="text-xs text-muted-foreground">
													{album.year ||
														"Unknown year"}{" "}
													• {album.trackCount} tracks
												</p>
											</div>
										</div>
									</button>
								))}
							</div>
						</div>
					</ScrollArea>
				</div>

				{/* Track List */}
				<div className="flex-1">
					{selectedAlbum ? (
						<ScrollArea className="h-full">
							<div className="p-6">
								<div className="mb-6">
									<h2 className="text-2xl font-bold mb-1">
										{selectedAlbum.name}
									</h2>
									<p className="text-sm text-muted-foreground">
										{selectedAlbum.year || "Unknown year"}
									</p>
								</div>

								<div className="space-y-1">
									{selectedAlbum.tracks.map(
										(track, index) => (
											<button
												key={track.id}
												onClick={() =>
													onTrackClick(track)
												}
												className="group flex w-full items-center gap-4 rounded-lg p-2 transition-colors hover:bg-accent"
											>
												{/* Track Number */}
												<span className="w-8 text-center text-sm text-muted-foreground">
													{track.trackNumber ||
														index + 1}
												</span>

												{/* Track Title */}
												<div className="min-w-0 flex-1 text-left">
													<p className="truncate text-sm font-medium">
														{track.title}
													</p>
												</div>

												{/* Duration */}
												<span className="text-sm text-muted-foreground">
													{formatTime(track.duration)}
												</span>

												{/* Play Button (on hover) */}
												<div className="opacity-0 group-hover:opacity-100">
													<PlayIcon className="h-4 w-4" />
												</div>
											</button>
										)
									)}
								</div>
							</div>
						</ScrollArea>
					) : (
						<div className="flex h-full items-center justify-center text-muted-foreground">
							<p>Select an album to view tracks</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
