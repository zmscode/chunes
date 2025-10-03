import { UserIcon } from "@phosphor-icons/react";
import { useArtistArtwork } from "@hooks/useArtistArtwork";
import { cn } from "@utils/tailwind";

interface ArtistAvatarProps {
	artistName: string;
	size?: "sm" | "md" | "lg" | "xl";
	className?: string;
}

const sizeClasses = {
	sm: "h-12 w-12",
	md: "h-16 w-16",
	lg: "h-32 w-32",
	xl: "h-48 w-48",
};

const iconSizeClasses = {
	sm: "h-6 w-6",
	md: "h-8 w-8",
	lg: "h-16 w-16",
	xl: "h-24 w-24",
};

export function ArtistAvatar({
	artistName,
	size = "md",
	className,
}: ArtistAvatarProps) {
	const { artworkUrl, isLoading, error } = useArtistArtwork(artistName);

	return (
		<div
			className={cn(
				"rounded-full overflow-hidden flex items-center justify-center aspect-square",
				artworkUrl ? "" : "bg-muted",
				!className && sizeClasses[size],
				className
			)}
		>
			{artworkUrl ? (
				<img
					src={artworkUrl}
					alt={artistName}
					className="h-full w-full object-cover"
				/>
			) : isLoading ? (
				<div className="h-full w-full bg-muted animate-pulse aspect-square" />
			) : (
				<UserIcon
					className={cn(
						"text-muted-foreground opacity-50",
						iconSizeClasses[size]
					)}
				/>
			)}
		</div>
	);
}
