import Footer from "@components/template/Footer";
import { useTranslation } from "react-i18next";
import { createFileRoute } from "@tanstack/react-router";
import { MiniPlayer } from "@components/MiniPlayer";
import { Button } from "@components/shadcn/button";
import { useState, useEffect } from "react";
import { useLibraryStore, usePlayerStore } from "@hooks/useStore";
import { useAudio } from "@services/audio/AudioContext";
import { getPlatformService } from "@services/platforms";
import {
	FolderIcon,
	PlayIcon,
	PauseIcon,
	MusicNotesIcon,
} from "@phosphor-icons/react";
import type { Track } from "@types";

function MusicLibrary() {
	const { t } = useTranslation();
	const [isScanning, setIsScanning] = useState(false);
	const [scanProgress, setScanProgress] = useState({ current: 0, total: 0 });
	const platformService = getPlatformService();
	const { tracksArray, actions: libraryActions } = useLibraryStore();
	const {
		actions: playerActions,
		isPlaying,
		currentTrackId,
	} = usePlayerStore();
	const audio = useAudio();

	const albumsMap = new Map<string, Track[]>();
	tracksArray.forEach((track) => {
		const albumKey = `${track.artist} - ${track.album}`;
		if (!albumsMap.has(albumKey)) {
			albumsMap.set(albumKey, []);
		}
		albumsMap.get(albumKey)!.push(track);
	});

	const handleSelectFolder = async () => {
		const folderPath = await platformService.selectFolder();
		if (folderPath) {
			await scanMusicFolder(folderPath);
		}
	};

	const scanMusicFolder = async (folderPath: string) => {
		setIsScanning(true);
		setScanProgress({ current: 0, total: 0 });

		try {
			const tracks: Track[] = [];

			for await (const result of platformService.scanMusicFolder(
				folderPath
			)) {
				if (result.type === "track" && result.track) {
					tracks.push(result.track);
					libraryActions.addTrack(result.track);
				} else if (result.type === "progress" && result.progress) {
					setScanProgress(result.progress);
				}
			}

			libraryActions.deriveAlbums();
			libraryActions.deriveArtists();
		} catch (error) {
			console.error("Error scanning music folder:", error);
		} finally {
			setIsScanning(false);
			libraryActions.setScanning(false);
		}
	};

	const handlePlayTrack = async (track: Track) => {
		const albumKey = `${track.artist} - ${track.album}`;
		const albumTracks = albumsMap.get(albumKey) || [track];
		const trackIndex = albumTracks.findIndex((t) => t.id === track.id);

		playerActions.setQueue(
			albumTracks.map((t) => t.id),
			trackIndex
		);

		await audio.playTrack(track);
	};

	const handleTogglePlay = async (track: Track) => {
		if (currentTrackId === track.id) {
			await audio.togglePlayPause();
		} else {
			await handlePlayTrack(track);
		}
	};

	useEffect(() => {
		if (platformService.isElectron && tracksArray.length === 0) {
		}
	}, []);

	return (
		<div className="flex flex-col gap-4 p-4 h-full overflow-hidden">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold flex items-center gap-2">
					<MusicNotesIcon className="h-6 w-6" />
					Music Library
				</h2>
				<Button onClick={handleSelectFolder} disabled={isScanning}>
					<FolderIcon className="h-4 w-4 mr-2" />
					{isScanning
						? `Scanning... (${scanProgress.current}/${scanProgress.total})`
						: "Select Music Folder"}
				</Button>
			</div>

			{tracksArray.length === 0 && !isScanning && (
				<div className="flex-1 flex items-center justify-center text-muted-foreground">
					<div className="text-center">
						<MusicNotesIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
						<p>No music in library</p>
						<p className="text-sm mt-2">
							Click "Select Music Folder" to add your music
						</p>
					</div>
				</div>
			)}

			{tracksArray.length > 0 && (
				<div className="flex-1 overflow-auto">
					<div className="space-y-6">
						{Array.from(albumsMap.entries()).map(
							([albumKey, tracks]) => {
								const firstTrack = tracks[0];
								return (
									<div
										key={albumKey}
										className="border rounded-lg p-4"
									>
										<div className="flex items-start gap-4 mb-3">
											{firstTrack.artwork && (
												<img
													src={firstTrack.artwork}
													alt={firstTrack.album}
													className="w-20 h-20 rounded object-cover"
												/>
											)}
											<div className="flex-1">
												<h3 className="font-semibold text-lg">
													{firstTrack.album}
												</h3>
												<p className="text-muted-foreground">
													{firstTrack.artist}
												</p>
												{firstTrack.year && (
													<p className="text-sm text-muted-foreground">
														{firstTrack.year}
													</p>
												)}
											</div>
										</div>
										<div className="space-y-1">
											{tracks
												.sort(
													(a, b) =>
														(a.trackNumber || 0) -
														(b.trackNumber || 0)
												)
												.map((track) => {
													const isCurrentTrack =
														currentTrackId ===
														track.id;
													const isTrackPlaying =
														isCurrentTrack &&
														isPlaying;

													return (
														<div
															key={track.id}
															className={`flex items-center gap-3 p-2 rounded hover:bg-accent/50 transition-colors ${
																isCurrentTrack
																	? "bg-accent"
																	: ""
															}`}
														>
															<Button
																size="icon"
																variant="ghost"
																className="h-8 w-8"
																onClick={() =>
																	handleTogglePlay(
																		track
																	)
																}
															>
																{isTrackPlaying ? (
																	<PauseIcon className="h-4 w-4" />
																) : (
																	<PlayIcon className="h-4 w-4" />
																)}
															</Button>
															{track.trackNumber && (
																<span className="text-sm text-muted-foreground w-6 text-right">
																	{
																		track.trackNumber
																	}
																</span>
															)}
															<div className="flex-1 min-w-0">
																<p
																	className={`text-sm truncate ${isCurrentTrack ? "font-semibold" : ""}`}
																>
																	{
																		track.title
																	}
																</p>
															</div>
															<span className="text-sm text-muted-foreground">
																{formatDuration(
																	track.duration
																)}
															</span>
														</div>
													);
												})}
										</div>
									</div>
								);
							}
						)}
					</div>
				</div>
			)}

			<div className="text-sm text-muted-foreground text-center">
				{tracksArray.length} tracks in library
			</div>
		</div>
	);
}

function formatDuration(seconds: number): string {
	if (!seconds || !isFinite(seconds)) return "0:00";
	const minutes = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function SecondPage() {
	const { t } = useTranslation();

	return (
		<div className="flex h-full flex-col">
			<MusicLibrary />
			<MiniPlayer />
			<Footer />
		</div>
	);
}

export const Route = createFileRoute("/second")({
	component: SecondPage,
});
