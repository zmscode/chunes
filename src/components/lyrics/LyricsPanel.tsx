import { useEffect, useState, useRef, useCallback } from "react";
import { ScrollArea } from "@components/shadcn/scroll-area";
import { Button } from "@components/shadcn/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@components/shadcn/card";
import { MusicNotesIcon, XIcon, ClockIcon } from "@phosphor-icons/react";
import { cn } from "@utils/tailwind";
import { LyricsParser } from "@services/lyrics/LyricsParser";
import { useAudio } from "@services/audio/AudioContext";
import { useCurrentTrack } from "@hooks/useStore";
import { getPlatformService } from "@services/platforms";
import { LyricsPanelProps } from "@props";
import { ParsedLyrics } from "@types";

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
			const exists = await platformService.fileExists(lrcPath);

			if (!exists) {
				setError("No lyrics file found");
				setLyrics(null);
				return;
			}

			const buffer = await platformService.readFile(lrcPath);
			const content = new TextDecoder().decode(buffer);

			const isValid = LyricsParser.validate(content);

			if (!isValid) {
				setError("Invalid lyrics file format");
				setLyrics(null);
				return;
			}

			const parsed = LyricsParser.parse(content);
			setLyrics(parsed);
		} catch (err) {
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

	return (
		<Card
			className={cn(
				"h-full flex flex-col border-0 shadow-none bg-transparent",
				className
			)}
		>
			<CardHeader className="flex flex-row items-center justify-between shrink-0 pt-16 pb-4">
				<div className="flex-1 min-w-0">
					<CardTitle className="truncate">
						{currentTrack.title}
					</CardTitle>
					<p className="text-sm text-muted-foreground truncate">
						{currentTrack.artist}
					</p>
				</div>
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
					{lines.map((line, idx) => {
						const currentLineIndex = lines.findIndex(
							(l) => l.isCurrent
						);
						const distance =
							currentLineIndex >= 0
								? Math.abs(idx - currentLineIndex)
								: 0;
						const isPast =
							currentLineIndex >= 0 && idx < currentLineIndex;

						return (
							<div
								key={line.index}
								data-lyric-index={line.index}
								onClick={() => handleLineClick(line.time)}
								className={cn(
									"transition-all duration-500 cursor-pointer py-2 rounded-lg px-4 text-center",
									"hover:bg-accent/50",
									line.isCurrent &&
										"text-primary font-semibold text-2xl scale-105 bg-accent",
									!line.isCurrent &&
										isPast &&
										"text-muted-foreground/40 text-lg",
									!line.isCurrent &&
										!isPast &&
										"text-muted-foreground text-lg"
								)}
								style={{
									opacity: line.isCurrent
										? 1
										: Math.max(0.3, 1 - distance * 0.2),
									filter: line.isCurrent
										? "blur(0px)"
										: `blur(${distance * 0.5}px)`,
								}}
							>
								<p className="leading-relaxed break-words">
									{line.text}
								</p>
								{line.translation && (
									<p className="text-sm mt-1 italic opacity-75 break-words">
										{line.translation}
									</p>
								)}
							</div>
						);
					})}
				</div>
			</ScrollArea>
		</Card>
	);
}
