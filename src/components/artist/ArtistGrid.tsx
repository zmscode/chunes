import { useState, useCallback } from "react";
import { Button } from "@components/shadcn/button";
import { PlayIcon, UserIcon } from "@phosphor-icons/react";
import { cn } from "@utils/tailwind";
import { Artist } from "@types";
import { ArtistAvatar } from "@components/artist/ArtistAvatar";

export interface ArtistGridProps {
	artists: Artist[];
	onArtistClick: (artist: Artist) => void;
	onArtistPlay: (artist: Artist) => void;
}

export function ArtistGrid({
	artists,
	onArtistClick,
	onArtistPlay,
}: ArtistGridProps) {
	const [hoveredArtist, setHoveredArtist] = useState<string | null>(null);

	const handlePlayClick = useCallback(
		(e: React.MouseEvent, artist: Artist) => {
			e.stopPropagation();
			onArtistPlay(artist);
		},
		[onArtistPlay]
	);

	return (
		<div className="p-6">
			<div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
				{artists.map((artist) => (
					<div
						key={artist.id}
						className="group cursor-pointer"
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
				))}
			</div>

			{artists.length === 0 && (
				<div className="flex h-64 items-center justify-center text-muted-foreground">
					<div className="text-center">
						<UserIcon className="mx-auto mb-4 h-12 w-12 opacity-50" />
						<p>No artists found</p>
					</div>
				</div>
			)}
		</div>
	);
}
