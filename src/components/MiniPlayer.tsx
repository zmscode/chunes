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
import { LiquidGlass } from "liquid-glass-ui";

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
		<LiquidGlass
			className="border-t shadow-2xl"
			style={{
				background: "rgba(0, 0, 0, 0.5)",
			}}
			intensity={0.5}
			blur={16}
		>
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
					<div className="flex justify-between mt-1 text-xs text-white/80">
						<span>{seek.formattedTime}</span>
						<span>-{seek.remainingTime}</span>
					</div>
				</div>

				{/* Main Control Area */}
				<div className="flex items-center gap-4 p-4">
					{/* Track Info */}
					<div className="flex items-center gap-3 min-w-0 flex-1">
						{trackInfo.track.artwork && (
							<LiquidGlass
								className="w-14 h-14 overflow-hidden rounded-lg shrink-0"
								intensity={0.3}
								blur={8}
							>
								<img
									src={trackInfo.track.artwork}
									alt={trackInfo.track.album}
									className="w-full h-full object-cover"
								/>
							</LiquidGlass>
						)}
						<div className="min-w-0 flex-1">
							<div className="font-medium truncate text-sm text-white">
								{trackInfo.track.title}
							</div>
							<div className="text-xs text-white/70 truncate">
								{trackInfo.track.artist}
							</div>
						</div>
					</div>

					{/* Playback Controls */}
					<div className="flex items-center gap-2 shrink-0">
						<LiquidGlass
							className="rounded-full"
							intensity={0.2}
							blur={6}
						>
							<Button
								size="icon"
								variant="ghost"
								onClick={playerActions.toggleShuffle}
								className={cn(
									"h-9 w-9 bg-transparent border-0",
									shuffleMode === ShuffleMode.ON &&
										"text-primary"
								)}
							>
								<ShuffleIcon className="h-4 w-4" />
							</Button>
						</LiquidGlass>

						<LiquidGlass
							className="rounded-full"
							intensity={0.2}
							blur={6}
							style={{
								opacity: trackInfo.hasPrevious ? 1 : 0.5,
							}}
						>
							<Button
								size="icon"
								variant="ghost"
								disabled={!trackInfo.hasPrevious}
								onClick={controls.playPrevious}
								className="h-9 w-9 bg-transparent border-0"
							>
								<SkipBackIcon className="h-5 w-5" />
							</Button>
						</LiquidGlass>

						<LiquidGlass
							className="rounded-full"
							intensity={0.4}
							blur={10}
						>
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
						</LiquidGlass>

						<LiquidGlass
							className="rounded-full"
							intensity={0.2}
							blur={6}
							style={{
								opacity: trackInfo.hasNext ? 1 : 0.5,
							}}
						>
							<Button
								size="icon"
								variant="ghost"
								disabled={!trackInfo.hasNext}
								onClick={controls.playNext}
								className="h-9 w-9 bg-transparent border-0"
							>
								<SkipForwardIcon className="h-5 w-5" />
							</Button>
						</LiquidGlass>

						<LiquidGlass
							className="rounded-full"
							intensity={0.2}
							blur={6}
						>
							<Button
								size="icon"
								variant="ghost"
								onClick={playerActions.toggleRepeatMode}
								className={cn(
									"h-9 w-9 bg-transparent border-0",
									repeatMode !== RepeatMode.OFF &&
										"text-primary"
								)}
							>
								{getRepeatIcon()}
							</Button>
						</LiquidGlass>
					</div>

					{/* Volume & Queue */}
					<div className="flex items-center gap-4 min-w-0 flex-1 justify-end">
						<div className="flex items-center gap-2 min-w-[140px]">
							<LiquidGlass
								className="rounded-full"
								intensity={0.2}
								blur={6}
							>
								<Button
									size="icon"
									variant="ghost"
									onClick={volume.toggleMute}
									className="h-9 w-9 shrink-0 bg-transparent border-0"
								>
									{volume.isMuted ? (
										<SpeakerXIcon className="h-4 w-4" />
									) : (
										<SpeakerHighIcon className="h-4 w-4" />
									)}
								</Button>
							</LiquidGlass>
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

						<QueuePanel
							trigger={
								<LiquidGlass
									className="rounded-lg"
									intensity={0.3}
									blur={8}
								>
									<Button
										variant="outline"
										size="sm"
										className="bg-transparent border-white/20"
									>
										<ListIcon className="h-4 w-4 mr-2" />
										Queue
									</Button>
								</LiquidGlass>
							}
						/>
					</div>
				</div>

				<div className="px-4 pb-2">
					<div className="text-xs text-white/70 text-center">
						Track {trackInfo.queuePosition} of{" "}
						{trackInfo.queueLength}
					</div>
				</div>
			</div>
		</LiquidGlass>
	);
}
