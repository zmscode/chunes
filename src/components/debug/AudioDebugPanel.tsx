import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@components/shadcn/card";
import { Badge } from "@components/shadcn/badge";
import { Button } from "@components/shadcn/button";
import { useAudio } from "@services/audio/AudioContext";
import { usePlayerStore, useCurrentTrack } from "@hooks/useStore";
import { ScrollArea } from "@components/shadcn/scroll-area";
import { useCallback } from "react";
import { toast } from "sonner";

export function AudioDebugPanel() {
	const audio = useAudio();
	const playerState = usePlayerStore();
	const currentTrack = useCurrentTrack();

	const testAudio = useCallback(() => {
		const testUrl =
			"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
		console.log("Testing with external URL:", testUrl);
		toast.info("Testing external audio...");

		// Create a test audio element
		const testAudioEl = new Audio(testUrl);

		testAudioEl.addEventListener("canplay", () => {
			console.log("Test audio: canplay event fired");
			toast.success("Test audio loaded successfully!");
		});

		testAudioEl.addEventListener("error", (e) => {
			console.error("Test audio error:", e);
			toast.error("Test audio failed!");
		});

		testAudioEl
			.play()
			.then(() => {
				console.log("Test audio playing successfully!");
				toast.success("Test audio playing!");
				// Stop after 2 seconds
				setTimeout(() => {
					testAudioEl.pause();
					testAudioEl.remove();
					console.log("Test audio stopped");
				}, 2000);
			})
			.catch((err) => {
				console.error("Test audio failed:", err);
				toast.error(`Test failed: ${err.message}`);
			});
	}, []);

	const logFullState = useCallback(() => {
		console.log("=== AUDIO DEBUG INFO ===");
		console.log("Audio Engine:", {
			isInitialized: audio.isInitialized,
			isLoading: audio.isLoading,
			error: audio.error,
			currentTime: audio.currentTime,
			duration: audio.duration,
			volume: audio.volume,
			playbackRate: audio.playbackRate,
		});
		console.log("Player State:", {
			isPlaying: playerState.isPlaying,
			currentTrackId: playerState.currentTrackId,
			queueIndex: playerState.queueIndex,
			queueLength: playerState.queue.length,
			repeatMode: playerState.repeatMode,
			shuffleMode: playerState.shuffleMode,
		});
		console.log("Current Track:", currentTrack);
		console.log("Queue:", playerState.queue);
		console.log("=======================");

		toast.success("State logged to console! (Check DevTools Console tab)");
	}, [audio, playerState, currentTrack]);

	return (
		<Card className="fixed bottom-20 right-4 w-96 z-50">
			<CardHeader>
				<CardTitle className="text-sm flex items-center justify-between">
					Audio Debug
					<Button size="sm" variant="outline" onClick={testAudio}>
						Test External Audio
					</Button>
				</CardTitle>
			</CardHeader>
			<CardContent>
				<ScrollArea className="h-96">
					<div className="space-y-4 text-xs">
						{/* Audio Engine Status */}
						<div>
							<h3 className="font-semibold mb-2">Audio Engine</h3>
							<div className="space-y-1">
								<div className="flex justify-between">
									<span>Initialized:</span>
									<Badge
										variant={
											audio.isInitialized
												? "default"
												: "destructive"
										}
									>
										{audio.isInitialized ? "Yes" : "No"}
									</Badge>
								</div>
								<div className="flex justify-between">
									<span>Loading:</span>
									<Badge
										variant={
											audio.isLoading
												? "default"
												: "secondary"
										}
									>
										{audio.isLoading ? "Yes" : "No"}
									</Badge>
								</div>
								<div className="flex justify-between">
									<span>Error:</span>
									{audio.error ? (
										<span className="text-destructive text-xs break-words max-w-[200px]">
											{audio.error}
										</span>
									) : (
										<Badge variant="secondary">None</Badge>
									)}
								</div>
							</div>
						</div>

						{/* Player State */}
						<div>
							<h3 className="font-semibold mb-2">Player State</h3>
							<div className="space-y-1">
								<div className="flex justify-between">
									<span>Playing:</span>
									<Badge
										variant={
											playerState.isPlaying
												? "default"
												: "secondary"
										}
									>
										{playerState.isPlaying ? "Yes" : "No"}
									</Badge>
								</div>
								<div className="flex justify-between">
									<span>Volume:</span>
									<span>
										{Math.round(audio.volume * 100)}%
									</span>
								</div>
								<div className="flex justify-between">
									<span>Current Time:</span>
									<span>{audio.currentTime.toFixed(2)}s</span>
								</div>
								<div className="flex justify-between">
									<span>Duration:</span>
									<span>{audio.duration.toFixed(2)}s</span>
								</div>
							</div>
						</div>

						{/* Current Track */}
						<div>
							<h3 className="font-semibold mb-2">
								Current Track
							</h3>
							{currentTrack ? (
								<div className="space-y-1">
									<div>
										<span className="font-medium">
											Title:
										</span>
										<div className="text-muted-foreground break-words">
											{currentTrack.title}
										</div>
									</div>
									<div>
										<span className="font-medium">
											Artist:
										</span>
										<div className="text-muted-foreground">
											{currentTrack.artist}
										</div>
									</div>
									<div>
										<span className="font-medium">
											Album:
										</span>
										<div className="text-muted-foreground">
											{currentTrack.album}
										</div>
									</div>
									<div>
										<span className="font-medium">
											File:
										</span>
										<div className="text-muted-foreground break-all text-[10px]">
											{currentTrack.filepath}
										</div>
									</div>
									<div>
										<span className="font-medium">ID:</span>
										<div className="text-muted-foreground break-all text-[10px]">
											{currentTrack.id}
										</div>
									</div>
								</div>
							) : (
								<p className="text-muted-foreground">
									No track loaded
								</p>
							)}
						</div>

						{/* Queue Info */}
						<div>
							<h3 className="font-semibold mb-2">Queue</h3>
							<div className="space-y-1">
								<div className="flex justify-between">
									<span>Length:</span>
									<span>{playerState.queue.length}</span>
								</div>
								<div className="flex justify-between">
									<span>Current Index:</span>
									<span>{playerState.queueIndex}</span>
								</div>
							</div>
						</div>

						{/* Console Log Button */}
						<div>
							<Button
								size="sm"
								variant="outline"
								className="w-full"
								onClick={logFullState}
							>
								Log Full State to Console
							</Button>
						</div>
					</div>
				</ScrollArea>
			</CardContent>
		</Card>
	);
}
