import { createFileRoute } from "@tanstack/react-router";
import { useLibraryStore } from "@hooks/useStore";
import { Button } from "@components/shadcn/button";
import { ListIcon, PlusIcon } from "@phosphor-icons/react";

function PlaylistsPage() {
	const { playlistsArray } = useLibraryStore();

	return (
		<div className="flex h-full flex-col">
			{/* Header */}
			<div className="border-b p-6">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">
							Playlists
						</h1>
						<p className="text-sm text-muted-foreground mt-1">
							{playlistsArray.length} playlist
							{playlistsArray.length !== 1 ? "s" : ""}
						</p>
					</div>
					<Button>
						<PlusIcon className="h-4 w-4 mr-2" />
						New Playlist
					</Button>
				</div>
			</div>

			{/* Content */}
			<div className="flex-1 overflow-y-auto p-6">
				{playlistsArray.length === 0 ? (
					<div className="flex h-full items-center justify-center text-center text-muted-foreground">
						<div>
							<ListIcon className="mx-auto mb-4 h-16 w-16 opacity-50" />
							<p className="text-lg font-medium mb-2">
								No playlists yet
							</p>
							<p className="text-sm mb-6">
								Create your first playlist to organize your
								music
							</p>
							<Button>
								<PlusIcon className="h-4 w-4 mr-2" />
								Create Playlist
							</Button>
						</div>
					</div>
				) : (
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
						{playlistsArray.map((playlist) => (
							<div
								key={playlist.id}
								className="group cursor-pointer rounded-lg border p-4 transition-all hover:bg-accent"
							>
								<div className="mb-3 aspect-square rounded bg-muted flex items-center justify-center">
									<ListIcon className="h-12 w-12 text-muted-foreground opacity-50" />
								</div>
								<p className="font-medium truncate">
									{playlist.name}
								</p>
								<p className="text-sm text-muted-foreground">
									{playlist.tracks.length} track
									{playlist.tracks.length !== 1 ? "s" : ""}
								</p>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

export const Route = createFileRoute("/playlists")({
	component: PlaylistsPage,
});
