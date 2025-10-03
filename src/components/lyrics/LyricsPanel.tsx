import { useEffect, useState, useRef, useCallback } from "react";
import { ScrollArea } from "@components/shadcn/scroll-area";
import { Button } from "@components/shadcn/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@components/shadcn/card";
import { Slider } from "@components/shadcn/slider";
import { MusicNotesIcon, XIcon, ClockIcon } from "@phosphor-icons/react";
import { cn } from "@utils/tailwind";
import { LyricsParser, ParsedLyrics } from "@services/lyrics/LyricsParser";
import { useAudio } from "@services/audio/AudioContext";
import { useCurrentTrack } from "@hooks/useStore";
import { getPlatformService } from "@services/platforms";
import { LyricsPanelProps } from "@props";

export function LyricsPanel({ onClose, className }: LyricsPanelProps) {
	const currentTrack = useCurrentTrack();
	const { currentTime, seek } = useAudio();
	const platformService = getPlatformService();

	const [lyrics, setLyrics] = useState<ParsedLyrics | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [timeOffset, setTimeOffset] = useState(0);
	const scrollAreaRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!currentTrack?.lrcPath) {
			setLyrics(null);
			setError(null);
			return;
		}

		loadLyrics(currentTrack.lrcPath);
	}, [currentTrack?.lrcPath]);

	const loadLyrics = async (lrcPath: string) => {
		setIsLoading(true);
		setError(null);

		try {
			console.log("🎵 Loading lyrics from:", lrcPath);
			const exists = await platformService.fileExists(lrcPath);
			console.log("🎵 File exists:", exists);

			if (!exists) {
				setError("No lyrics file found");
				setLyrics(null);
				return;
			}

			const buffer = await platformService.readFile(lrcPath);
			const content = new TextDecoder().decode(buffer);
			console.log("🎵 File content length:", content.length);
			console.log("🎵 First 200 chars:", content.substring(0, 200));

			const isValid = LyricsParser.validate(content);
			console.log("🎵 Validation result:", isValid);

			if (!isValid) {
				setError("Invalid lyrics file format");
				setLyrics(null);
				return;
			}

			const parsed = LyricsParser.parse(content);
			console.log("🎵 Parsed lyrics:", {
				linesCount: parsed.lines.length,
				firstLine: parsed.lines[0],
				metadata: parsed.metadata
			});
			setLyrics(parsed);
		} catch (err) {
			console.error("Error loading lyrics:", err);
			setError("Failed to load lyrics");
			setLyrics(null);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (!lyrics || !scrollAreaRef.current) return;

		const { index } = LyricsParser.getCurrentLine(
			lyrics,
			currentTime + timeOffset
		);

		if (index >= 0) {
			const element = scrollAreaRef.current.querySelector(
				`[data-lyric-index="${index}"]`
			);
			if (element) {
				element.scrollIntoView({
					behavior: "smooth",
					block: "center",
				});
			}
		}
	}, [currentTime, lyrics, timeOffset]);

	const handleLineClick = useCallback(
		(time: number) => {
			seek(time - timeOffset);
		},
		[seek, timeOffset]
	);

	const adjustOffset = useCallback((delta: number) => {
		setTimeOffset((prev) => prev + delta);
	}, []);

	if (!currentTrack) {
		return (
			<Card className={cn("h-full", className)}>
				<CardContent className="flex h-full items-center justify-center text-muted-foreground">
					<div className="text-center">
						<MusicNotesIcon className="mx-auto mb-4 h-16 w-16 opacity-50" />
						<p>No track playing</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (isLoading) {
		return (
			<Card className={cn("h-full", className)}>
				<CardContent className="flex h-full items-center justify-center">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
						<p className="text-muted-foreground">
							Loading lyrics...
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (error || !lyrics) {
		return (
			<Card className={cn("h-full", className)}>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>Lyrics</CardTitle>
					{onClose && (
						<Button
							variant="ghost"
							size="icon"
							onClick={onClose}
							className="h-8 w-8"
						>
							<XIcon className="h-4 w-4" />
						</Button>
					)}
				</CardHeader>
				<CardContent className="flex h-full items-center justify-center text-muted-foreground">
					<div className="text-center">
						<MusicNotesIcon className="mx-auto mb-4 h-16 w-16 opacity-50" />
						<p className="mb-2">
							{error || "No lyrics available for this track"}
						</p>
						<p className="text-sm">
							Add a .lrc file with the same name as your audio
							file
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	const { lines } = LyricsParser.getLyricsWindow(
		lyrics,
		currentTime + timeOffset,
		3,
		4
	);

	console.log("📝 Lyrics Display Debug:", {
		currentTime,
		timeOffset,
		adjustedTime: currentTime + timeOffset,
		totalLines: lyrics.lines.length,
		displayedLines: lines.length,
		lines: lines.map(l => ({ time: l.time, text: l.text, isCurrent: l.isCurrent }))
	});

	return (
		<Card className={cn("h-full flex flex-col", className)}>
			<CardHeader className="flex flex-row items-center justify-between shrink-0">
				<div className="flex-1 min-w-0">
					<CardTitle className="truncate">
						{currentTrack.title}
					</CardTitle>
					<p className="text-sm text-muted-foreground truncate">
						{currentTrack.artist}
					</p>
				</div>
				{onClose && (
					<Button
						variant="ghost"
						size="icon"
						onClick={onClose}
						className="h-8 w-8 shrink-0"
					>
						<XIcon className="h-4 w-4" />
					</Button>
				)}
			</CardHeader>

			{timeOffset !== 0 && (
				<div className="px-6 pb-4 shrink-0">
					<div className="flex items-center gap-2 text-sm">
						<ClockIcon className="h-4 w-4 text-muted-foreground" />
						<span className="text-muted-foreground">
							Offset: {timeOffset > 0 ? "+" : ""}
							{timeOffset.toFixed(1)}s
						</span>
						<Button
							size="sm"
							variant="outline"
							onClick={() => setTimeOffset(0)}
							className="ml-auto"
						>
							Reset
						</Button>
					</div>
				</div>
			)}

			<ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
				<div className="space-y-4 py-4">
					{lines.map((line) => (
						<div
							key={line.index}
							data-lyric-index={line.index}
							onClick={() => handleLineClick(line.time)}
							className={cn(
								"transition-all duration-300 cursor-pointer py-2 rounded-lg px-4",
								"hover:bg-accent/50",
								line.isCurrent
									? "text-primary font-semibold text-xl scale-105 bg-accent"
									: "text-muted-foreground text-base opacity-60"
							)}
						>
							<p className="leading-relaxed">{line.text}</p>
							{line.translation && (
								<p className="text-sm mt-1 italic opacity-75">
									{line.translation}
								</p>
							)}
						</div>
					))}
				</div>
			</ScrollArea>

			<div className="border-t p-4 shrink-0">
				<div className="space-y-2">
					<div className="flex items-center justify-between text-sm">
						<span className="text-muted-foreground">
							Sync Adjustment
						</span>
						<span className="font-medium">
							{timeOffset.toFixed(1)}s
						</span>
					</div>
					<div className="flex items-center gap-2">
						<Button
							size="sm"
							variant="outline"
							onClick={() => adjustOffset(-0.5)}
						>
							-0.5s
						</Button>
						<Slider
							value={[timeOffset]}
							onValueChange={([value]) => setTimeOffset(value)}
							min={-5}
							max={5}
							step={0.1}
							className="flex-1"
						/>
						<Button
							size="sm"
							variant="outline"
							onClick={() => adjustOffset(0.5)}
						>
							+0.5s
						</Button>
					</div>
				</div>
			</div>
		</Card>
	);
}
