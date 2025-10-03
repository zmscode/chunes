import { useState } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Button } from "@components/shadcn/button";
import { Separator } from "@components/shadcn/separator";
import {
	MusicNotesIcon,
	MagnifyingGlassIcon,
	HeartIcon,
	ClockIcon,
	GearIcon,
	CaretLeftIcon,
	CaretRightIcon,
	PlaylistIcon,
	UserIcon,
} from "@phosphor-icons/react";
import { cn } from "@utils/tailwind";
import DragWindowRegion from "@components/DragWindowRegion";
import { MiniPlayer } from "@components/MiniPlayer";
import { Toaster } from "@components/shadcn/sonner";
import { PlayerLayoutProps } from "@props";

export default function PlayerLayout({ children }: PlayerLayoutProps) {
	const location = useLocation();
	const navigate = useNavigate();
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

	const isActive = (path: string) => location.pathname === path;

	const navItems = [
		{
			path: "/library",
			label: "Library",
			icon: MusicNotesIcon,
		},
		{
			path: "/artists",
			label: "Artists",
			icon: UserIcon,
		},
		{
			path: "/search",
			label: "Search",
			icon: MagnifyingGlassIcon,
		},
		{
			path: "/playlists",
			label: "Playlists",
			icon: PlaylistIcon,
		},
	];

	const collectionItems = [
		{
			path: "/favourites",
			label: "Favourites",
			icon: HeartIcon,
		},
		{
			path: "/recent",
			label: "Recently Played",
			icon: ClockIcon,
		},
	];

	return (
		<div className="flex h-screen flex-col overflow-hidden bg-gradient-to-br from-neutral-100 via-neutral-50 to-neutral-100 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
			<DragWindowRegion title="Chunes Music Player" />

			<div className="flex flex-1 overflow-hidden">
				<aside
					className="flex flex-col h-full border-r border-border bg-sidebar/95 backdrop-blur-md transition-all duration-200"
					style={{
						width: isSidebarCollapsed ? "64px" : "256px",
						paddingTop: "16px",
					}}
				>
					<div className="flex flex-col h-full">
						<div className="flex justify-end p-2">
							<Button
								variant="ghost"
								size="sm"
								onClick={() =>
									setIsSidebarCollapsed(!isSidebarCollapsed)
								}
								className="h-8 w-8 p-0"
							>
								{isSidebarCollapsed ? (
									<CaretRightIcon className="h-5 w-5" />
								) : (
									<CaretLeftIcon className="h-5 w-5" />
								)}
							</Button>
						</div>

						<div className="flex-1 overflow-y-auto p-4">
							<nav className="space-y-1">
								{navItems.map((item) => (
									<Link key={item.path} to={item.path}>
										<Button
											variant="ghost"
											className={cn(
												"w-full justify-start rounded-lg transition-all",
												isActive(item.path)
													? "bg-sidebar-accent text-sidebar-accent-foreground"
													: "text-sidebar-foreground hover:bg-sidebar-accent/50",
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
										<h3 className="mb-2 px-2 text-sm font-semibold text-sidebar-foreground/50 uppercase tracking-wide">
											Collection
										</h3>
										<nav className="space-y-1">
											{collectionItems.map((item) => (
												<Link
													key={item.path}
													to={item.path}
												>
													<Button
														variant="ghost"
														className={cn(
															"w-full justify-start rounded-lg transition-all",
															isActive(item.path)
																? "bg-sidebar-accent text-sidebar-accent-foreground"
																: "text-sidebar-foreground hover:bg-sidebar-accent/50"
														)}
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

						<div className="p-4 border-t border-sidebar-border">
							<Button
								variant="ghost"
								onClick={() => navigate({ to: "/settings" })}
								className={cn(
									"w-full justify-start rounded-lg transition-all",
									isActive("/settings")
										? "bg-sidebar-accent text-sidebar-accent-foreground"
										: "text-sidebar-foreground hover:bg-sidebar-accent/50",
									isSidebarCollapsed && "justify-center px-2"
								)}
							>
								<GearIcon className="h-5 w-5" />
								{!isSidebarCollapsed && (
									<span className="ml-3">Settings</span>
								)}
							</Button>
						</div>
					</div>
				</aside>

				<main
					className={cn(
						"flex-1 overflow-y-auto bg-background pb-[200px]"
					)}
				>
					{children}
				</main>
			</div>

			<div
				className={cn(
					"fixed bottom-0 right-0 z-50 transition-all",
					isSidebarCollapsed ? "left-16" : "left-64"
				)}
			>
				<MiniPlayer />
			</div>

			<Toaster />
		</div>
	);
}
