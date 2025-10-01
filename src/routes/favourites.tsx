import { createFileRoute } from "@tanstack/react-router";
import { HeartIcon } from "@phosphor-icons/react";

function FavoritesPage() {
	return (
		<div className="flex h-full flex-col">
			<div className="border-b p-6">
				<h1 className="text-3xl font-bold tracking-tight">Favorites</h1>
				<p className="text-sm text-muted-foreground mt-1">
					Your most loved tracks
				</p>
			</div>

			<div className="flex-1 overflow-y-auto p-6">
				<div className="flex h-full items-center justify-center text-center text-muted-foreground">
					<div>
						<HeartIcon className="mx-auto mb-4 h-16 w-16 opacity-50" />
						<p className="text-lg font-medium">No favorites yet</p>
						<p className="text-sm mt-2">
							Heart tracks to add them to your favorites
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export const Route = createFileRoute("/favourites")({
	component: FavoritesPage,
});
