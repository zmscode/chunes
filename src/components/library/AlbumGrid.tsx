import { useState, useCallback, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Button } from "@components/shadcn/button";
import { PlayIcon, MusicNotesIcon, BooksIcon } from "@phosphor-icons/react";
import { cn } from "@utils/tailwind";
import { Album } from "@types";
import { AlbumGridProps } from "@props";

export function AlbumGrid({
	albums,
	onAlbumClick,
	onAlbumPlay,
	allTracks,
	onAllTracksClick,
	onAllTracksPlay,
}: AlbumGridProps) {
	const [hoveredAlbum, setHoveredAlbum] = useState<string | null>(null);
	const [localAlbums, setLocalAlbums] = useState(albums);

	useEffect(() => {
		setLocalAlbums(albums);
	}, [albums]);

	const handleDragEnd = (result: DropResult) => {
		if (!result.destination) return;

		const items = Array.from(localAlbums);
		const [reorderedItem] = items.splice(result.source.index, 1);
		items.splice(result.destination.index, 0, reorderedItem);

		setLocalAlbums(items);
	};

	const uniqueArtists = allTracks
		? new Set(allTracks.map((track) => track.artist)).size
		: 0;

	const handlePlayClick = useCallback(
		(e: React.MouseEvent, album: Album) => {
			e.stopPropagation();
			onAlbumPlay(album);
		},
		[onAlbumPlay]
	);

	const handleAllTracksPlay = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			if (onAllTracksPlay) {
				onAllTracksPlay();
			}
		},
		[onAllTracksPlay]
	);

	return (
		<DragDropContext onDragEnd={handleDragEnd}>
			<div className="p-6">
				<Droppable droppableId="albums" direction="horizontal">
					{(provided) => (
						<div
							ref={provided.innerRef}
							{...provided.droppableProps}
							className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
						>
							{allTracks && allTracks.length > 0 && (
					<div
						key="all-songs"
						className="group cursor-pointer"
						onClick={() => onAllTracksClick && onAllTracksClick()}
						onMouseEnter={() => setHoveredAlbum("all-songs")}
						onMouseLeave={() => setHoveredAlbum(null)}
					>
						<div
							className={cn(
								"relative overflow-hidden rounded-2xl shadow-md mb-3 transition-all duration-200 scale-[0.8] origin-center",
								hoveredAlbum === "all-songs" &&
									"shadow-xl -translate-y-2 scale-[0.85]"
							)}
						>
							<div className="aspect-square">
								<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/80 to-primary/40">
									<BooksIcon
										className="h-16 w-16 text-white"
										weight="regular"
									/>
								</div>
							</div>

							<div
								className={cn(
									"absolute inset-0 flex items-center justify-center bg-black/40 transition-all duration-200",
									hoveredAlbum === "all-songs"
										? "opacity-100"
										: "opacity-0"
								)}
							>
								<Button
									size="icon"
									className="h-14 w-14 rounded-full bg-white text-black hover:bg-white/90 hover:scale-110 shadow-xl transition-all"
									onClick={handleAllTracksPlay}
								>
									<PlayIcon className="h-6 w-6" />
								</Button>
							</div>
						</div>

						<div className="space-y-1">
							<h3 className="truncate font-medium text-sm transition-colors">
								Library
							</h3>
							<p className="truncate text-xs text-muted-foreground">
								{uniqueArtists} artist
								{uniqueArtists !== 1 ? "s" : ""}
							</p>
							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								<span>
									{allTracks.length} track
									{allTracks.length !== 1 ? "s" : ""}
								</span>
							</div>
						</div>
					</div>
				)}

				{localAlbums.map((album, index) => (
					<Draggable key={album.id} draggableId={album.id} index={index}>
						{(provided, snapshot) => (
							<div
								ref={provided.innerRef}
								{...provided.draggableProps}
								{...provided.dragHandleProps}
								className={cn(
									"group cursor-pointer",
									snapshot.isDragging && "opacity-50"
								)}
								onClick={() => onAlbumClick(album)}
								onMouseEnter={() => setHoveredAlbum(album.id)}
								onMouseLeave={() => setHoveredAlbum(null)}
							>
						<div
							className={cn(
								"relative overflow-hidden rounded-lg shadow-md mb-3 transition-all duration-200",
								hoveredAlbum === album.id &&
									"shadow-xl -translate-y-2 scale-105"
							)}
						>
							<div className="aspect-square">
								{album.artwork ? (
									<img
										src={album.artwork}
										alt={album.name}
										className="h-full w-full object-cover"
									/>
								) : (
									<div className="flex h-full w-full items-center justify-center bg-muted">
										<MusicNotesIcon className="h-16 w-16 text-muted-foreground opacity-50" />
									</div>
								)}
							</div>

							<div
								className={cn(
									"absolute inset-0 flex items-center justify-center bg-black/40 transition-all duration-200",
									hoveredAlbum === album.id
										? "opacity-100"
										: "opacity-0"
								)}
							>
								<Button
									size="icon"
									className="h-14 w-14 rounded-full bg-white text-black hover:bg-white/90 hover:scale-110 shadow-xl transition-all"
									onClick={(e) => handlePlayClick(e, album)}
								>
									<PlayIcon className="h-6 w-6" />
								</Button>
							</div>
						</div>

						<div className="space-y-1">
							<h3 className="truncate font-medium text-sm transition-colors">
								{album.name}
							</h3>
							<p className="truncate text-xs text-muted-foreground">
								{album.artist}
							</p>
							<div className="flex items-center gap-2 text-xs text-muted-foreground">
								{album.year && <span>{album.year}</span>}
								{album.year && <span>•</span>}
								<span>
									{album.trackCount} track
									{album.trackCount !== 1 ? "s" : ""}
								</span>
							</div>
						</div>
					</div>
						)}
					</Draggable>
				))}
				{provided.placeholder}
			</div>
					)}
				</Droppable>

			{albums.length === 0 && (
				<div className="flex h-64 items-center justify-center text-muted-foreground">
					<div className="text-center">
						<MusicNotesIcon className="mx-auto mb-4 h-12 w-12 opacity-50" />
						<p>No albums found</p>
					</div>
				</div>
			)}
			</div>
		</DragDropContext>
	);
}
