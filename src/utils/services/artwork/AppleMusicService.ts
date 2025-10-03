import { AppleMusicArtist } from "@types";

export class AppleMusicService {
	private static readonly MUSIC_API_URL = "https://api.music.apple.com/v1";
	private static readonly ITUNES_URL = "https://itunes.apple.com";
	private static cache = new Map<string, AppleMusicArtist | null>();

	private static DEVELOPER_TOKEN =
		import.meta.env.VITE_APPLE_MUSIC_TOKEN || "";

	static setDeveloperToken(token: string): void {
		this.DEVELOPER_TOKEN = token;
	}

	private static async searchWithMusicAPI(
		artistName: string
	): Promise<AppleMusicArtist | null> {
		if (!this.DEVELOPER_TOKEN) {
			return null;
		}

		try {
			const encodedName = encodeURIComponent(artistName);
			const url = `${this.MUSIC_API_URL}/catalog/us/search?term=${encodedName}&types=artists&limit=1`;

			const response = await fetch(url, {
				headers: {
					Authorization: `Bearer ${this.DEVELOPER_TOKEN}`,
				},
			});

			if (!response.ok) {
				return null;
			}

			const data = await response.json();

			if (data.results?.artists?.data?.[0]) {
				const artist = data.results.artists.data[0];
				const attributes = artist.attributes;

				let artwork;
				if (attributes.artwork?.url) {
					const artworkUrl = attributes.artwork.url
						.replace("{w}", "1000")
						.replace("{h}", "1000");

					artwork = {
						url: artworkUrl,
						width: 1000,
						height: 1000,
					};
				}

				return {
					id: artist.id,
					name: attributes.name,
					artwork,
					genres: attributes.genreNames,
				};
			}

			return null;
		} catch (error) {
			return null;
		}
	}

	private static async searchWithiTunesAPI(
		artistName: string
	): Promise<AppleMusicArtist | null> {
		try {
			const encodedName = encodeURIComponent(artistName);

			const url = `${this.ITUNES_URL}/search?term=${encodedName}&entity=album&limit=10`;
			const response = await fetch(url);

			if (!response.ok) {
				return null;
			}

			const data = await response.json();

			if (data.results && data.results.length > 0) {
				const sortedResults = data.results.sort((a: any, b: any) => {
					const dateA = new Date(a.releaseDate || 0).getTime();
					const dateB = new Date(b.releaseDate || 0).getTime();
					return dateB - dateA;
				});

				for (const album of sortedResults) {
					if (album.artworkUrl100) {
						const highResUrl = album.artworkUrl100
							.replace("100x100", "1000x1000")
							.replace("100x100bb", "1000x1000bb");

						return {
							id: album.artistId?.toString() || artistName,
							name: artistName,
							artwork: {
								url: highResUrl,
								width: 1000,
								height: 1000,
							},
							genres: album.primaryGenreName
								? [album.primaryGenreName]
								: undefined,
						};
					}
				}
			}

			return null;
		} catch (error) {
			return null;
		}
	}

	static async searchArtist(
		artistName: string
	): Promise<AppleMusicArtist | null> {
		if (this.cache.has(artistName)) {
			return this.cache.get(artistName) || null;
		}

		let artist = await this.searchWithMusicAPI(artistName);

		if (!artist || !artist.artwork) {
			artist = await this.searchWithiTunesAPI(artistName);
		}

		this.cache.set(artistName, artist);

		return artist;
	}

	static async getArtistArtwork(artistName: string): Promise<string | null> {
		const artist = await this.searchArtist(artistName);
		return artist?.artwork?.url || null;
	}

	static clearCache(): void {
		this.cache.clear();
	}

	static async preloadArtists(artistNames: string[]): Promise<void> {
		await Promise.all(
			artistNames.map(name => this.searchArtist(name))
		);
	}
}
