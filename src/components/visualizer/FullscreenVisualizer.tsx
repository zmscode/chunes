import { useState } from "react";
import { Dialog, DialogContent } from "@components/shadcn/dialog";
import { Button } from "@components/shadcn/button";
import { AudioVisualizer } from "./AudioVisualizer";
import { useCurrentTrack, usePlayerStore } from "@hooks/useStore";
import { XIcon } from "@phosphor-icons/react";
import { FullscreenVisualizerProps } from "@props";

export function FullscreenVisualizer({ trigger }: FullscreenVisualizerProps) {
	const [open, setOpen] = useState(false);
	const currentTrack = useCurrentTrack();
	const { queue, queueIndex } = usePlayerStore();

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{trigger}
			<DialogContent className="max-w-screen h-screen p-0 bg-black/95">
				<Button
					variant="ghost"
					size="icon"
					className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
					onClick={() => setOpen(false)}
				>
					<XIcon className="h-6 w-6" />
				</Button>

				<div className="relative w-full h-full">
					<AudioVisualizer className="w-full h-full" />

					{currentTrack && (
						<div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
							<div className="container mx-auto flex items-center gap-6">
								{currentTrack.artwork && (
									<img
										src={currentTrack.artwork}
										alt={currentTrack.album}
										className="w-24 h-24 rounded-lg shadow-2xl"
									/>
								)}
								<div className="text-white">
									<h2 className="text-3xl font-bold mb-2">
										{currentTrack.title}
									</h2>
									<p className="text-xl text-white/80">
										{currentTrack.artist}
									</p>
									<p className="text-lg text-white/60">
										{currentTrack.album}
									</p>
									<p className="text-sm text-white/40 mt-2">
										Track {queueIndex + 1} of {queue.length}
									</p>
								</div>
							</div>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
