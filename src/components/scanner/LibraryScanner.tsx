import { useState, useCallback } from "react";
import { Button } from "@components/shadcn/button";
import { Progress } from "@components/shadcn/progress";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@components/shadcn/dialog";
import { FolderIcon, CheckIcon } from "@phosphor-icons/react";
import { getPlatformService } from "@services/platforms";
import { useLibraryStore } from "@hooks/useStore";
import type { Track } from "@types";

interface LibraryScannerProps {
	onScanComplete?: (trackCount: number) => void;
}

export function LibraryScanner({ onScanComplete }: LibraryScannerProps) {
	const [isScanning, setIsScanning] = useState(false);
	const [showDialog, setShowDialog] = useState(false);
	const [scanProgress, setScanProgress] = useState({ current: 0, total: 0 });
	const [currentFile, setCurrentFile] = useState<string>("");
	const [scanComplete, setScanComplete] = useState(false);
	const [tracksAdded, setTracksAdded] = useState(0);

	const platformService = getPlatformService();
	const { actions: libraryActions } = useLibraryStore();

	const handleSelectFolder = useCallback(async () => {
		const folderPath = await platformService.selectFolder();
		if (folderPath) {
			await scanMusicFolder(folderPath);
		}
	}, []);

	const scanMusicFolder = async (folderPath: string) => {
		setIsScanning(true);
		setShowDialog(true);
		setScanComplete(false);
		setScanProgress({ current: 0, total: 0 });
		setTracksAdded(0);
		libraryActions.setScanning(true);

		try {
			const tracks: Track[] = [];

			for await (const result of platformService.scanMusicFolder(
				folderPath
			)) {
				if (result.type === "track" && result.track) {
					tracks.push(result.track);
					libraryActions.addTrack(result.track);
					setTracksAdded((prev) => prev + 1);
				} else if (result.type === "progress" && result.progress) {
					setScanProgress(result.progress);
					if (result.progress.currentFile) {
						setCurrentFile(result.progress.currentFile);
					}
				}
			}

			libraryActions.deriveAlbums();
			libraryActions.deriveArtists();

			setScanComplete(true);
			if (onScanComplete) {
				onScanComplete(tracks.length);
			}
		} catch (error) {
			console.error("Error scanning music folder:", error);
		} finally {
			setIsScanning(false);
			libraryActions.setScanning(false);
		}
	};

	const handleClose = () => {
		if (!isScanning) {
			setShowDialog(false);
			setScanComplete(false);
		}
	};

	const progressPercentage =
		scanProgress.total > 0
			? Math.round((scanProgress.current / scanProgress.total) * 100)
			: 0;

	return (
		<>
			<Button
				onClick={handleSelectFolder}
				disabled={isScanning}
				size="lg"
				className="gap-2"
			>
				<FolderIcon className="h-5 w-5" />
				{isScanning ? "Scanning..." : "Select Music Folder"}
			</Button>

			<Dialog open={showDialog} onOpenChange={handleClose}>
				<DialogContent className="sm:max-w-md" hideClose={isScanning}>
					<DialogHeader>
						<DialogTitle>
							{scanComplete
								? "Scan Complete"
								: "Scanning Music Library"}
						</DialogTitle>
						<DialogDescription>
							{scanComplete
								? `Successfully added ${tracksAdded} tracks to your library`
								: "Please wait while we scan your music files..."}
						</DialogDescription>
					</DialogHeader>

					{!scanComplete ? (
						<div className="space-y-4 py-4">
							<div className="space-y-2">
								<div className="flex items-center justify-between text-sm">
									<span className="text-muted-foreground">
										Progress
									</span>
									<span className="font-medium">
										{scanProgress.current} /{" "}
										{scanProgress.total}
									</span>
								</div>
								<Progress value={progressPercentage} />
								<p className="text-xs text-muted-foreground">
									{progressPercentage}%
								</p>
							</div>

							{currentFile && (
								<div className="space-y-1">
									<p className="text-sm text-muted-foreground">
										Current file:
									</p>
									<p className="truncate rounded bg-muted px-3 py-2 text-sm font-mono">
										{currentFile}
									</p>
								</div>
							)}

							<div className="rounded-lg border bg-muted/50 p-4">
								<div className="flex items-center justify-between">
									<span className="text-sm font-medium">
										Tracks found
									</span>
									<span className="text-2xl font-bold text-primary">
										{tracksAdded}
									</span>
								</div>
							</div>
						</div>
					) : (
						<div className="py-8">
							<div className="mb-6 flex justify-center">
								<div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
									<CheckIcon className="h-8 w-8 text-green-500" />
								</div>
							</div>

							<div className="space-y-2 text-center">
								<p className="text-lg font-semibold">
									{tracksAdded} tracks added
								</p>
								<p className="text-sm text-muted-foreground">
									Your library has been updated successfully
								</p>
							</div>

							<div className="mt-6 flex justify-center">
								<Button onClick={handleClose}>Done</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}
