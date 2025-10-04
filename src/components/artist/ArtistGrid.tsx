import { useState, useCallback, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Button } from "@components/shadcn/button";
import { PlayIcon, UserIcon, UsersThreeIcon } from "@phosphor-icons/react";
import { cn } from "@utils/tailwind";
import { Artist } from "@types";
import { ArtistAvatar } from "@components/artist/ArtistAvatar";

export interface ArtistGridProps {
	artists: Artist[];
	onArtistClick: (artist: Artist) => void;
	onArtistPlay: (artist: Artist) => void;
	onAllArtistsClick?: () => void;
}

export function ArtistGrid({
	artists,
	onArtistClick,
	onArtistPlay,
	onAllArtistsClick,
}: ArtistGridProps) {
	const [hoveredArtist, setHoveredArtist] = useState<string | null>(null);
	const [localArtists, setLocalArtists] = useState(artists);

	useEffect(() => {
		setLocalArtists(artists);
	}, [artists]);

	const handleDragEnd = (result: DropResult) => {
		if (!result.destination) return;

		const items = Array.from(localArtists);
		const [reorderedItem] = items.splice(result.source.index, 1);
		items.splice(result.destination.index, 0, reorderedItem);

		setLocalArtists(items);
	};

	const handlePlayClick = useCallback(
		(e: React.MouseEvent, artist: Artist) => {
			e.stopPropagation();
			onArtistPlay(artist);
		},
		[onArtistPlay]
	);

	return (
		<DragDropContext onDragEnd={handleDragEnd}>
			<div className="p-6">
				<Droppable droppableId="artists" direction="horizontal">
					{(provided) => (
						<div
							ref={provided.innerRef}
							{...provided.droppableProps}
							className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
						>
							{onAllArtistsClick && artists.length > 0 && (
					<div
						key="all-artists"
						className="group cursor-pointer"
						onClick={onAllArtistsClick}
						onMouseEnter={() => setHoveredArtist("all-artists")}
						onMouseLeave={() => setHoveredArtist(null)}
					>
						<div className="relative mb-3 aspect-square overflow-visible">
							<div className="relative w-full h-full">
								<div
									className={cn(
										"w-full h-full rounded-full flex items-center justify-center bg-gradient-to-br from-primary/80 to-primary/40 shadow-md transition-all duration-200 scale-[0.8] origin-center",
										hoveredArtist === "all-artists" &&
											"shadow-xl scale-[0.85]"
									)}
								>
									<UsersThreeIcon
										className="h-16 w-16 text-white"
										weight="regular"
									/>
								</div>

								<div
									className={cn(
										"absolute inset-0 flex items-center justify-center transition-all duration-200 rounded-full scale-[0.8] origin-center",
										hoveredArtist === "all-artists"
											? "opacity-100 bg-black/40 scale-[0.85]"
											: "opacity-0"
									)}
								>
									<Button
										size="icon"
										className="h-14 w-14 rounded-full bg-white text-black hover:bg-white/90 hover:scale-110 shadow-xl transition-all"
										onClick={(e) => {
											e.stopPropagation();
											onAllArtistsClick();
										}}
									>
										<PlayIcon className="h-6 w-6" />
									</Button>
								</div>
							</div>
						</div>

						<div className="space-y-1 text-center">
							<h3 className="truncate font-medium text-sm transition-colors">
								All Artists
							</h3>
							<p className="truncate text-xs text-muted-foreground">
								{artists.length} artist
								{artists.length !== 1 ? "s" : ""}
							</p>
						</div>
					</div>
				)}

				{localArtists.map((artist, index) => (
					<Draggable key={artist.id} draggableId={artist.id} index={index}>
						{(provided, snapshot) => (
							<div
								ref={provided.innerRef}
								{...provided.draggableProps}
								{...provided.dragHandleProps}
								className={cn(
									"group cursor-pointer",
									snapshot.isDragging && "opacity-50"
								)}
								onClick={() => onArtistClick(artist)}
								onMouseEnter={() => setHoveredArtist(artist.id)}
								onMouseLeave={() => setHoveredArtist(null)}
							>
						<div className="relative mb-3 aspect-square overflow-visible">
							<div className="relative w-full h-full">
								<ArtistAvatar
									artistName={artist.name}
									className={cn(
										"w-full h-full transition-all duration-200 shadow-md",
										hoveredArtist === artist.id &&
											"shadow-xl scale-105"
									)}
								/>

								<div
									className={cn(
										"absolute inset-0 flex items-center justify-center transition-all duration-200 rounded-full",
										hoveredArtist === artist.id
											? "opacity-100 bg-black/40 scale-105"
											: "opacity-0"
									)}
								>
									<Button
										size="icon"
										className="h-14 w-14 rounded-full bg-white text-black hover:bg-white/90 hover:scale-110 shadow-xl transition-all"
										onClick={(e) =>
											handlePlayClick(e, artist)
										}
									>
										<PlayIcon className="h-6 w-6" />
									</Button>
								</div>
							</div>
						</div>

						<div className="space-y-1 text-center">
							<h3 className="truncate font-medium text-sm transition-colors">
								{artist.name}
							</h3>
							<p className="truncate text-xs text-muted-foreground">
								{artist.albums.length} album
								{artist.albums.length !== 1 ? "s" : ""}
							</p>
						</div>
					</div>
						)}
					</Draggable>
				))}
				{provided.placeholder}
			</div>
					)}
				</Droppable>

			{artists.length === 0 && (
				<div className="flex h-64 items-center justify-center text-muted-foreground">
					<div className="text-center">
						<UserIcon className="mx-auto mb-4 h-12 w-12 opacity-50" />
						<p>No artists found</p>
					</div>
				</div>
			)}
			</div>
		</DragDropContext>
	);
}
