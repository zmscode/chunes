// src/routes/lyrics.tsx
import { createFileRoute } from "@tanstack/react-router";
import { LyricsPanel } from "@components/lyrics/LyricsPanel";
import { LyricsDebugPanel } from "@components/debug/LyricsDebugPanel";

function LyricsPage() {
	return (
		<div className="h-full p-6">
			<LyricsPanel className="max-w-4xl mx-auto h-full" />
			<LyricsDebugPanel />
		</div>
	);
}

export const Route = createFileRoute("/lyrics")({
	component: LyricsPage,
});
