import {
	useAudioControls,
	useAudioSeek,
	useAudioVolume,
	useCurrentTrackInfo,
	useAudioKeyboardShortcuts,
} from "@hooks/useAudioHooks";
import { Button } from "@components/ui/button";
import { Slider } from "@components/ui/slider";
import {
	PlayIcon,
	PauseIcon,
	SkipBackIcon,
	SkipForwardIcon,
	SpeakerHighIcon,
	SpeakerXIcon,
} from "@phosphor-icons/react";

export function MiniPlayer() {
	const controls = useAudioControls();
	const seek = useAudioSeek();
	const volume = useAudioVolume();
	const trackInfo = useCurrentTrackInfo();

	useAudioKeyboardShortcuts(true);

	if (!trackInfo.track) {
		return null;
	}

	return (
		<div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
			<div className="container mx-auto flex items-center gap-4">
				<div className="flex items-center gap-3 min-w-0 flex-1">
					{trackInfo.track.artwork && (
						<img
							src={trackInfo.track.artwork}
							alt={trackInfo.track.album}
							className="w-12 h-12 rounded object-cover"
						/>
					)}
					<div className="min-w-0">
						<div className="font-medium truncate">
							{trackInfo.track.title}
						</div>
						<div className="text-sm text-muted-foreground truncate">
							{trackInfo.track.artist}
						</div>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<Button
						size="icon"
						variant="ghost"
						onClick={controls.playPrevious}
						disabled={!trackInfo.hasPrevious}
					>
						<SkipBackIcon className="h-4 w-4" />
					</Button>

					<Button
						size="icon"
						variant="default"
						onClick={controls.togglePlayPause}
					>
						{controls.isPlaying ? (
							<PauseIcon className="h-4 w-4" />
						) : (
							<PlayIcon className="h-4 w-4" />
						)}
					</Button>

					<Button
						size="icon"
						variant="ghost"
						onClick={controls.playNext}
						disabled={!trackInfo.hasNext}
					>
						<SkipForwardIcon className="h-4 w-4" />
					</Button>
				</div>

				<div className="flex items-center gap-2 flex-1 max-w-md">
					<span className="text-xs text-muted-foreground w-10 text-right">
						{seek.formattedTime}
					</span>
					<Slider
						value={[seek.progress]}
						onValueChange={([value]) => {
							const newTime = (value / 100) * seek.duration;
							seek.seek(newTime);
						}}
						max={100}
						step={0.1}
						className="flex-1"
					/>
					<span className="text-xs text-muted-foreground w-10">
						{seek.formattedDuration}
					</span>
				</div>

				<div className="flex items-center gap-2 min-w-[120px]">
					<Button
						size="icon"
						variant="ghost"
						onClick={volume.toggleMute}
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
						className="w-20"
					/>
				</div>
			</div>
		</div>
	);
}
