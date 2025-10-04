import { useState } from "react";
import {
	useAudioControls,
	useAudioSeek,
	useAudioVolume,
	useCurrentTrackInfo,
	useAudioKeyboardShortcuts,
} from "@hooks/useAudioHooks";
import { usePlayerStore, useLibraryStore } from "@hooks/useStore";
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
	QueueIcon,
	MicrophoneStageIcon,
	HeartIcon,
} from "@phosphor-icons/react";
import { QueuePanel } from "@components/queue/QueuePanel";
import { Sheet, SheetContent, SheetTrigger } from "@components/shadcn/sheet";
import { LyricsPanel } from "@components/lyrics/LyricsPanel";
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
	const { actions: libraryActions } = useLibraryStore();
	const [lyricsOpen, setLyricsOpen] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);

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
		<div className="border-t border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
			<div className="container mx-auto max-w-full">
				<div className="px-2 sm:px-4 pt-2">
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
					<div className="flex justify-between mt-1 text-xs text-white/60">
						<span>{seek.formattedTime}</span>
						<span>-{seek.remainingTime}</span>
					</div>
				</div>

				<div className="flex items-center gap-2 sm:gap-4 p-2 sm:p-4">
					<div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
						{trackInfo.track.artwork && (
							<div className="w-12 h-12 sm:w-14 sm:h-14 overflow-hidden rounded-lg shrink-0 shadow-md">
								<img
									src={trackInfo.track.artwork}
									alt={trackInfo.track.album}
									className="w-full h-full object-cover"
								/>
							</div>
						)}
						<div className="min-w-0 flex-1">
							<div className="font-medium truncate text-xs sm:text-sm text-white">
								{trackInfo.track.title}
							</div>
							<div className="text-xs text-white/60 truncate hidden sm:block">
								{trackInfo.track.artist}
							</div>
						</div>
						<Button
							size="icon"
							variant="ghost"
							onClick={() => {
								libraryActions.toggleFavourite(trackInfo.track!.id);
								setIsAnimating(true);
								setTimeout(() => setIsAnimating(false), 300);
							}}
							className="h-8 w-8 sm:h-9 sm:w-9 rounded-full hover:bg-white/10 transition-colors shrink-0"
						>
							<HeartIcon
								className="h-5 w-5 transition-colors duration-200"
								weight={trackInfo.track.isFavourite ? "fill" : "regular"}
								style={{
									color: trackInfo.track.isFavourite ? 'oklch(0.7176 0.1603 25.41)' : undefined,
									animation: isAnimating ? 'wiggle 0.3s ease-in-out' : undefined
								}}
							/>
						</Button>
					</div>

					<div className="flex items-center gap-1 sm:gap-2 shrink-0">
						<Button
							size="icon"
							variant="ghost"
							onClick={playerActions.toggleShuffle}
							className={cn(
								"h-8 w-8 sm:h-9 sm:w-9 rounded-full hover:bg-white/10 transition-colors hidden sm:flex items-center justify-center",
								shuffleMode === ShuffleMode.ON && "text-primary"
							)}
						>
							<ShuffleIcon className="h-4 w-4" />
						</Button>

						<Button
							size="icon"
							variant="ghost"
							disabled={!trackInfo.hasPrevious}
							onClick={controls.playPrevious}
							className={cn(
								"h-8 w-8 sm:h-9 sm:w-9 rounded-full hover:bg-white/10 transition-colors",
								!trackInfo.hasPrevious && "opacity-30"
							)}
						>
							<SkipBackIcon className="h-4 w-4 sm:h-5 sm:w-5" />
						</Button>

						<Button
							size="icon"
							variant="default"
							onClick={controls.togglePlayPause}
							className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white text-black hover:bg-white/90 hover:scale-105 transition-all"
						>
							{controls.isPlaying ? (
								<PauseIcon className="h-4 w-4 sm:h-5 sm:w-5" />
							) : (
								<PlayIcon className="h-4 w-4 sm:h-5 sm:w-5" />
							)}
						</Button>

						<Button
							size="icon"
							variant="ghost"
							disabled={!trackInfo.hasNext}
							onClick={controls.playNext}
							className={cn(
								"h-8 w-8 sm:h-9 sm:w-9 rounded-full hover:bg-white/10 transition-colors",
								!trackInfo.hasNext && "opacity-30"
							)}
						>
							<SkipForwardIcon className="h-4 w-4 sm:h-5 sm:w-5" />
						</Button>

						<Button
							size="icon"
							variant="ghost"
							onClick={playerActions.toggleRepeatMode}
							className={cn(
								"h-8 w-8 sm:h-9 sm:w-9 rounded-full hover:bg-white/10 transition-colors hidden sm:flex items-center justify-center",
								repeatMode !== RepeatMode.OFF && "text-primary"
							)}
						>
							{getRepeatIcon()}
						</Button>
					</div>

					<div className="hidden lg:flex items-center gap-4 min-w-0 flex-1 justify-end">
						<div className="flex items-center gap-2 min-w-[140px]">
							<Button
								size="icon"
								variant="ghost"
								onClick={volume.toggleMute}
								className="h-9 w-9 shrink-0 rounded-full hover:bg-white/10 transition-colors"
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

						<Sheet open={lyricsOpen} onOpenChange={setLyricsOpen}>
							<SheetTrigger asChild>
								<Button
									size="icon"
									variant="ghost"
									className="h-9 w-9 rounded-full hover:bg-white/10 transition-colors"
								>
									<MicrophoneStageIcon className="h-4 w-4" />
								</Button>
							</SheetTrigger>
							<SheetContent
								side="right"
								className="w-full sm:max-w-lg bg-black/40 backdrop-blur-xl border-white/10 p-0"
							>
								<LyricsPanel
									onClose={() => setLyricsOpen(false)}
									className="h-full"
								/>
							</SheetContent>
						</Sheet>

						<QueuePanel
							trigger={
								<Button
									size="icon"
									variant="ghost"
									className="h-9 w-9 rounded-full hover:bg-white/10 transition-colors"
								>
									<QueueIcon className="h-4 w-4" />
								</Button>
							}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
