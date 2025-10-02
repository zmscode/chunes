import { useState, useCallback } from "react";
import { Button } from "@components/shadcn/button";
import { PlayIcon, MusicNotesIcon } from "@phosphor-icons/react";
import { cn } from "@utils/tailwind";
import { Album } from "@types";
import { AlbumGridProps } from "@props";
import { LiquidGlass } from "liquid-glass-ui";

export function AlbumGrid({
	albums,
	onAlbumClick,
	onAlbumPlay,
}: AlbumGridProps) {
	const [hoveredAlbum, setHoveredAlbum] = useState<string | null>(null);

	const handlePlayClick = useCallback(
		(e: React.MouseEvent, album: Album) => {
			e.stopPropagation();
			onAlbumPlay(album);
		},
		[onAlbumPlay]
	);

	return (
		<div className="p-6">
			<div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
				{albums.map((album) => (
					<div
						key={album.id}
						className="group cursor-pointer"
						onClick={() => onAlbumClick(album)}
						onMouseEnter={() => setHoveredAlbum(album.id)}
						onMouseLeave={() => setHoveredAlbum(null)}
					>
						<LiquidGlass
							className="relative overflow-hidden rounded-lg shadow-md mb-3"
							intensity={hoveredAlbum === album.id ? 0.5 : 0.3}
							blur={hoveredAlbum === album.id ? 12 : 8}
							style={{
								transition: "all 0.3s ease",
								transform:
									hoveredAlbum === album.id
										? "translateY(-8px) scale(1.02)"
										: "translateY(0) scale(1)",
							}}
						>
							<div className="aspect-square">
								{album.artwork ? (
									<img
										src={album.artwork}
										alt={album.name}
										className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
									/>
								) : (
									<div className="flex h-full w-full items-center justify-center bg-muted">
										<MusicNotesIcon className="h-16 w-16 text-muted-foreground opacity-50" />
									</div>
								)}
							</div>

							<div
								className={cn(
									"absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity duration-200",
									hoveredAlbum === album.id
										? "opacity-100"
										: "opacity-0"
								)}
							>
								<Button
									size="icon"
									className="h-14 w-14 rounded-full shadow-lg"
									onClick={(e) => handlePlayClick(e, album)}
								>
									<PlayIcon className="h-6 w-6" />
								</Button>
							</div>
						</LiquidGlass>

						<div className="space-y-1">
							<h3 className="truncate font-medium text-sm group-hover:text-primary transition-colors">
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
				))}
			</div>

			{albums.length === 0 && (
				<div className="flex h-64 items-center justify-center text-muted-foreground">
					<div className="text-center">
						<MusicNotesIcon className="mx-auto mb-4 h-12 w-12 opacity-50" />
						<p>No albums found</p>
					</div>
				</div>
			)}
		</div>
	);
}
