import {
	useAudioControls,
	useAudioSeek,
	useAudioVolume,
	useCurrentTrackInfo,
	useAudioKeyboardShortcuts,
} from "@hooks/useAudioHooks";
import { usePlayerStore } from "@hooks/useStore";
import { Button } from "@components/shadcn/button";
import { Slider } from "@components/shadcn/slider";
import {
	PlayIcon,
	PauseIcon,
	SkipBackIcon,
	SkipForwardIcon,
	SpeakerHighIcon,
	SpeakerXIcon,
	RepeatIcon,
	RepeatOnceIcon,
	ShuffleIcon,
	ListIcon,
} from "@phosphor-icons/react";
import { QueuePanel } from "@components/queue/QueuePanel";
import { cn } from "@utils/tailwind";
import { RepeatMode, ShuffleMode } from "@enums";

export function MiniPlayer() {
	const controls = useAudioControls();
	const seek = useAudioSeek();
	const volume = useAudioVolume();
	const trackInfo = useCurrentTrackInfo();
	const {
		repeatMode,
		shuffleMode,
		actions: playerActions,
	} = usePlayerStore();

	useAudioKeyboardShortcuts(true);

	if (!trackInfo.track) {
		return null;
	}

	const getRepeatIcon = () => {
		if (repeatMode === RepeatMode.ONE) {
			return <RepeatOnceIcon className="h-4 w-4" />;
		}
		return <RepeatIcon className="h-4 w-4" />;
	};

	return (
		<div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t shadow-lg">
			<div className="container mx-auto">
				{/* Progress Bar */}
				<div className="px-4 pt-2">
					<Slider
						value={[seek.progress]}
						onValueChange={([value]) => {
							const newTime = (value / 100) * seek.duration;
							seek.seek(newTime);
						}}
						max={100}
						step={0.1}
						className="cursor-pointer"
					/>
					<div className="flex justify-between mt-1 text-xs text-muted-foreground">
						<span>{seek.formattedTime}</span>
						<span>-{seek.remainingTime}</span>
					</div>
				</div>

				{/* Main Controls */}
				<div className="flex items-center gap-4 p-4">
					{/* Track Info */}
					<div className="flex items-center gap-3 min-w-0 flex-1">
						{trackInfo.track.artwork && (
							<div className="shrink-0 overflow-hidden rounded shadow-md">
								<img
									src={trackInfo.track.artwork}
									alt={trackInfo.track.album}
									className="w-14 h-14 object-cover"
								/>
							</div>
						)}
						<div className="min-w-0 flex-1">
							<div className="font-medium truncate text-sm">
								{trackInfo.track.title}
							</div>
							<div className="text-xs text-muted-foreground truncate">
								{trackInfo.track.artist}
							</div>
						</div>
					</div>

					{/* Playback Controls */}
					<div className="flex items-center gap-2 shrink-0">
						<Button
							size="icon"
							variant="ghost"
							onClick={playerActions.toggleShuffle}
							className={cn(
								"h-9 w-9",
								shuffleMode === ShuffleMode.ON && "text-primary"
							)}
						>
							<ShuffleIcon className="h-4 w-4" />
						</Button>

						<Button
							size="icon"
							variant="ghost"
							onClick={controls.playPrevious}
							disabled={!trackInfo.hasPrevious}
							className="h-9 w-9"
						>
							<SkipBackIcon className="h-5 w-5" />
						</Button>

						<Button
							size="icon"
							variant="default"
							onClick={controls.togglePlayPause}
							className="h-10 w-10"
						>
							{controls.isPlaying ? (
								<PauseIcon className="h-5 w-5" />
							) : (
								<PlayIcon className="h-5 w-5" />
							)}
						</Button>

						<Button
							size="icon"
							variant="ghost"
							onClick={controls.playNext}
							disabled={!trackInfo.hasNext}
							className="h-9 w-9"
						>
							<SkipForwardIcon className="h-5 w-5" />
						</Button>

						<Button
							size="icon"
							variant="ghost"
							onClick={playerActions.toggleRepeatMode}
							className={cn(
								"h-9 w-9",
								repeatMode !== RepeatMode.OFF && "text-primary"
							)}
						>
							{getRepeatIcon()}
						</Button>
					</div>

					{/* Volume & Queue */}
					<div className="flex items-center gap-4 min-w-0 flex-1 justify-end">
						{/* Volume Control */}
						<div className="flex items-center gap-2 min-w-[140px]">
							<Button
								size="icon"
								variant="ghost"
								onClick={volume.toggleMute}
								className="h-9 w-9 shrink-0"
							>
								{volume.isMuted ? (
									<SpeakerXIcon className="h-4 w-4" />
								) : (
									<SpeakerHighIcon className="h-4 w-4" />
								)}
							</Button>
							<Slider
								value={[volume.volume * 100]}
								onValueChange={([value]) =>
									volume.setVolume(value / 100)
								}
								max={100}
								step={1}
								className="w-24"
							/>
						</div>

						{/* Queue Button */}
						<QueuePanel
							trigger={
								<Button variant="outline" size="sm">
									<ListIcon className="h-4 w-4 mr-2" />
									Queue
								</Button>
							}
						/>
					</div>
				</div>

				{/* Queue Position Indicator */}
				<div className="px-4 pb-2">
					<div className="text-xs text-muted-foreground text-center">
						Track {trackInfo.queuePosition} of{" "}
						{trackInfo.queueLength}
					</div>
				</div>
			</div>
		</div>
	);
}
