import { useState, useEffect } from "react";
import { AppleMusicService } from "@services/artwork/AppleMusicService";

export function useArtistArtwork(artistName: string) {
	const [artworkUrl, setArtworkUrl] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function fetchArtwork() {
			if (!artistName) return;

			setIsLoading(true);
			setError(null);

			try {
				const url = await AppleMusicService.getArtistArtwork(
					artistName
				);

				if (!cancelled) {
					setArtworkUrl(url);
					setIsLoading(false);
				}
			} catch (err) {
				if (!cancelled) {
					setError(
						err instanceof Error
							? err
							: new Error("Failed to fetch artwork")
					);
					setIsLoading(false);
				}
			}
		}

		fetchArtwork();

		return () => {
			cancelled = true;
		};
	}, [artistName]);

	return { artworkUrl, isLoading, error };
}
