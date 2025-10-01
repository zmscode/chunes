import { ReactNode, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Button } from "@components/shadcn/button";
import { Separator } from "@components/shadcn/separator";
import {
	MusicNotesIcon,
	ListIcon,
	GearIcon,
	MagnifyingGlassIcon,
	HeartIcon,
	ClockIcon,
	WaveformIcon,
} from "@phosphor-icons/react";
import { cn } from "@utils/tailwind";
import DragWindowRegion from "@components/DragWindowRegion";
import { MiniPlayer } from "@components/MiniPlayer";
import { AudioVisualizer } from "@components/visualizer/AudioVisualizer";
import { FullscreenVisualizer } from "@components/visualizer/FullscreenVisualizer";
import { DialogTrigger } from "@components/shadcn/dialog";
import { useSettingsStore } from "@hooks/useStore";
import { Toaster } from "@components/shadcn/sonner";
import { PlayerLayoutProps } from "@props";

export default function PlayerLayout({ children }: PlayerLayoutProps) {
	const location = useLocation();
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
	const { showVisualizer } = useSettingsStore();

	const isActive = (path: string) => location.pathname === path;

	const navItems = [
		{
			path: "/library",
			label: "Library",
			icon: MusicNotesIcon,
		},
		{
			path: "/search",
			label: "Search",
			icon: MagnifyingGlassIcon,
		},
		{
			path: "/playlists",
			label: "Playlists",
			icon: ListIcon,
		},
		{
			path: "/lyrics",
			label: "Lyrics",
			icon: WaveformIcon,
		},
	];

	const collectionItems = [
		{
			path: "/favourites",
			label: "Favorites",
			icon: HeartIcon,
		},
		{
			path: "/recent",
			label: "Recently Played",
			icon: ClockIcon,
		},
	];

	const bottomPadding = showVisualizer ? "pb-[296px]" : "pb-[200px]";

	return (
		<div className="flex h-screen flex-col overflow-hidden bg-background">
			<DragWindowRegion title="Chunes Music Player" />

			<div className="flex flex-1 overflow-hidden">
				<aside
					className={cn(
						"flex flex-col border-r bg-muted/30 transition-all",
						isSidebarCollapsed ? "w-16" : "w-64"
					)}
				>
					<div className="flex-1 overflow-y-auto p-4">
						<nav className="space-y-1">
							{navItems.map((item) => (
								<Link key={item.path} to={item.path}>
									<Button
										variant={
											isActive(item.path)
												? "secondary"
												: "ghost"
										}
										className={cn(
											"w-full justify-start",
											isSidebarCollapsed &&
												"justify-center px-2"
										)}
									>
										<item.icon className="h-5 w-5" />
										{!isSidebarCollapsed && (
											<span className="ml-3">
												{item.label}
											</span>
										)}
									</Button>
								</Link>
							))}
						</nav>

						{!isSidebarCollapsed && (
							<>
								<Separator className="my-4" />

								<div>
									<h3 className="mb-2 px-2 text-sm font-semibold text-muted-foreground">
										Collection
									</h3>
									<nav className="space-y-1">
										{collectionItems.map((item) => (
											<Link
												key={item.path}
												to={item.path}
											>
												<Button
													variant={
														isActive(item.path)
															? "secondary"
															: "ghost"
													}
													className="w-full justify-start"
												>
													<item.icon className="h-5 w-5" />
													<span className="ml-3">
														{item.label}
													</span>
												</Button>
											</Link>
										))}
									</nav>
								</div>
							</>
						)}
					</div>

					<div className="border-t p-4 space-y-2">
						<FullscreenVisualizer
							trigger={
								<DialogTrigger asChild>
									<Button
										variant="ghost"
										className={cn(
											"w-full justify-start",
											isSidebarCollapsed &&
												"justify-center px-2"
										)}
									>
										<WaveformIcon className="h-5 w-5" />
										{!isSidebarCollapsed && (
											<span className="ml-3">
												Visualizer
											</span>
										)}
									</Button>
								</DialogTrigger>
							}
						/>

						<Link to="/settings">
							<Button
								variant={
									isActive("/settings")
										? "secondary"
										: "ghost"
								}
								className={cn(
									"w-full justify-start",
									isSidebarCollapsed && "justify-center px-2"
								)}
							>
								<GearIcon className="h-5 w-5" />
								{!isSidebarCollapsed && (
									<span className="ml-3">Settings</span>
								)}
							</Button>
						</Link>
					</div>
				</aside>

				<main className={cn("flex-1 overflow-y-auto", bottomPadding)}>
					{children}
				</main>
			</div>

			<div
				className={cn(
					"fixed bottom-0 right-0 z-50 transition-all",
					isSidebarCollapsed ? "left-16" : "left-64"
				)}
			>
				{showVisualizer && (
					<div className="h-24 border-t bg-background/95 backdrop-blur">
						<AudioVisualizer className="h-full" />
					</div>
				)}
				<MiniPlayer />
			</div>

			<Toaster />
		</div>
	);
}
