// src/components/debug/LyricsDebugPanel.tsx
import { useEffect, useState } from "react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@components/shadcn/card";
import { Button } from "@components/shadcn/button";
import { Badge } from "@components/shadcn/badge";
import { useCurrentTrack } from "@hooks/useStore";
import { getPlatformService } from "@services/platforms";
import { ScrollArea } from "@components/shadcn/scroll-area";

export function LyricsDebugPanel() {
	const currentTrack = useCurrentTrack();
	const platformService = getPlatformService();
	const [debugInfo, setDebugInfo] = useState<any>({});
	const [lrcContent, setLrcContent] = useState<string>("");

	useEffect(() => {
		if (!currentTrack) {
			setDebugInfo({});
			return;
		}

		checkLyrics();
	}, [currentTrack?.id]);

	const checkLyrics = async () => {
		if (!currentTrack) return;

		const info: any = {
			trackId: currentTrack.id,
			trackTitle: currentTrack.title,
			trackFilepath: currentTrack.filepath,
			lrcPath: currentTrack.lrcPath,
		};

		console.log("🎤 Lyrics Debug Info:", info);

		// Check if lrcPath exists
		if (!currentTrack.lrcPath) {
			info.error = "No lrcPath property on track";
			setDebugInfo(info);
			return;
		}

		// Check if file exists
		try {
			const exists = await platformService.fileExists(
				currentTrack.lrcPath
			);
			info.fileExists = exists;

			if (!exists) {
				info.error = `File does not exist: ${currentTrack.lrcPath}`;
				setDebugInfo(info);
				return;
			}

			// Try to read the file
			const buffer = await platformService.readFile(currentTrack.lrcPath);
			const content = new TextDecoder().decode(buffer);

			info.fileSize = buffer.byteLength;
			info.contentLength = content.length;
			info.firstLine = content.split("\n")[0];
			info.hasTimestamps = /\[\d{2}:\d{2}\.?\d{0,3}\]/.test(content);

			setLrcContent(content);
			setDebugInfo(info);
		} catch (error) {
			info.error = error instanceof Error ? error.message : String(error);
			setDebugInfo(info);
		}
	};

	return (
		<Card className="fixed bottom-24 right-4 w-[500px] z-50 max-h-[600px] flex flex-col">
			<CardHeader>
				<CardTitle className="text-sm flex items-center justify-between">
					Lyrics Debug Panel
					<Button size="sm" variant="outline" onClick={checkLyrics}>
						Refresh
					</Button>
				</CardTitle>
			</CardHeader>
			<CardContent className="flex-1 overflow-hidden flex flex-col">
				<ScrollArea className="flex-1">
					<div className="space-y-3 text-xs">
						{!currentTrack ? (
							<p className="text-muted-foreground">
								No track loaded
							</p>
						) : (
							<>
								<div>
									<span className="font-semibold">
										Track:
									</span>
									<div className="text-muted-foreground break-all">
										{debugInfo.trackTitle}
									</div>
								</div>

								<div>
									<span className="font-semibold">
										Audio File:
									</span>
									<div className="text-muted-foreground break-all text-[10px] font-mono">
										{debugInfo.trackFilepath}
									</div>
								</div>

								<div>
									<span className="font-semibold">
										LRC Path:
									</span>
									<div className="text-muted-foreground break-all text-[10px] font-mono">
										{debugInfo.lrcPath || "NOT SET"}
									</div>
								</div>

								<div className="flex items-center gap-2">
									<span className="font-semibold">
										File Exists:
									</span>
									<Badge
										variant={
											debugInfo.fileExists
												? "default"
												: "destructive"
										}
									>
										{debugInfo.fileExists ? "YES" : "NO"}
									</Badge>
								</div>

								{debugInfo.fileSize && (
									<div>
										<span className="font-semibold">
											File Size:
										</span>
										<span className="text-muted-foreground ml-2">
											{debugInfo.fileSize} bytes
										</span>
									</div>
								)}

								{debugInfo.contentLength && (
									<div>
										<span className="font-semibold">
											Content Length:
										</span>
										<span className="text-muted-foreground ml-2">
											{debugInfo.contentLength} characters
										</span>
									</div>
								)}

								{debugInfo.firstLine && (
									<div>
										<span className="font-semibold">
											First Line:
										</span>
										<div className="text-muted-foreground break-all font-mono text-[10px]">
											{debugInfo.firstLine}
										</div>
									</div>
								)}

								{debugInfo.hasTimestamps !== undefined && (
									<div className="flex items-center gap-2">
										<span className="font-semibold">
											Has Timestamps:
										</span>
										<Badge
											variant={
												debugInfo.hasTimestamps
													? "default"
													: "destructive"
											}
										>
											{debugInfo.hasTimestamps
												? "YES"
												: "NO"}
										</Badge>
									</div>
								)}

								{debugInfo.error && (
									<div>
										<span className="font-semibold text-destructive">
											Error:
										</span>
										<div className="text-destructive text-[10px] break-all mt-1">
											{debugInfo.error}
										</div>
									</div>
								)}

								{lrcContent && (
									<div>
										<span className="font-semibold">
											LRC Content Preview:
										</span>
										<div className="mt-2 p-2 bg-muted rounded text-[10px] font-mono max-h-[200px] overflow-auto">
											{lrcContent
												.split("\n")
												.slice(0, 20)
												.map((line, i) => (
													<div key={i}>{line}</div>
												))}
										</div>
									</div>
								)}
							</>
						)}
					</div>
				</ScrollArea>
			</CardContent>
		</Card>
	);
}
