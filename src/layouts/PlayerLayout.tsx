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
	SidebarSimpleIcon,
	PlaylistIcon,
	UserIcon,
} from "@phosphor-icons/react";
import { cn } from "@utils/tailwind";
import DragWindowRegion from "@components/DragWindowRegion";
import { MiniPlayer } from "@components/MiniPlayer";
import { Toaster } from "@components/shadcn/sonner";
import { PlayerLayoutProps } from "@props";
import { usePlayerStore } from "@hooks/useStore";

export default function PlayerLayout({ children }: PlayerLayoutProps) {
	const location = useLocation();
	const navigate = useNavigate();
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
	const { currentTrackId } = usePlayerStore();

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
				{/* Desktop Sidebar */}
				<aside
					className={cn(
						"hidden md:flex flex-col h-full border-r border-white/10 bg-sidebar/40 backdrop-blur-xl transition-all duration-200"
					)}
					style={{
						width: isSidebarCollapsed ? "80px" : "256px",
						paddingTop: "16px",
					}}
				>
					<div className="flex flex-col h-full">
						<div className={cn(
							"flex p-2 pt-3",
							isSidebarCollapsed ? "justify-center" : "justify-end"
						)}>
							<Button
								variant="ghost"
								size="sm"
								onClick={() =>
									setIsSidebarCollapsed(!isSidebarCollapsed)
								}
								className="h-8 w-8 p-0"
							>
								<SidebarSimpleIcon
									className={cn(
										"h-5 w-5 transition-transform duration-200",
										isSidebarCollapsed && "scale-x-[-1]"
									)}
								/>
							</Button>
						</div>

						<div className={cn(
							"flex-1 overflow-y-auto transition-all duration-300 ease-in-out",
							isSidebarCollapsed ? "p-2" : "p-4"
						)}>
							<nav className="space-y-1">
								{navItems.map((item) => (
									<Link key={item.path} to={item.path}>
										<Button
											variant="ghost"
											className={cn(
												"w-full justify-start rounded-lg transition-all duration-300 ease-in-out",
												isActive(item.path)
													? "bg-sidebar-accent text-sidebar-accent-foreground"
													: "text-sidebar-foreground hover:bg-sidebar-accent/50",
												isSidebarCollapsed &&
													"justify-center px-2 hover:scale-110 active:scale-100"
											)}
										>
											<item.icon className={cn(
												"transition-all duration-300 ease-in-out",
												isSidebarCollapsed ? "h-9 w-9" : "h-5 w-5"
											)} />
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
															"w-full justify-start rounded-lg transition-all duration-300 ease-in-out",
															isActive(item.path)
																? "bg-sidebar-accent text-sidebar-accent-foreground"
																: "text-sidebar-foreground hover:bg-sidebar-accent/50",
															isSidebarCollapsed &&
																"justify-center px-2 hover:scale-110 active:scale-100"
														)}
													>
														<item.icon className={cn(
															"transition-all duration-300 ease-in-out",
															isSidebarCollapsed ? "h-9 w-9" : "h-5 w-5"
														)} />
														{!isSidebarCollapsed && (
															<span className="ml-3">
																{item.label}
															</span>
														)}
													</Button>
												</Link>
											))}
										</nav>
									</div>
								</>
							)}
						</div>

						<div className={cn(
							"border-t border-sidebar-border transition-all duration-300 ease-in-out",
							isSidebarCollapsed ? "p-2" : "p-4"
						)}>
							<Button
								variant="ghost"
								onClick={() => navigate({ to: "/settings" })}
								className={cn(
									"w-full justify-start rounded-lg transition-all duration-300 ease-in-out",
									isActive("/settings")
										? "bg-sidebar-accent text-sidebar-accent-foreground"
										: "text-sidebar-foreground hover:bg-sidebar-accent/50",
									isSidebarCollapsed && "justify-center px-2 hover:scale-110 active:scale-100"
								)}
							>
								<GearIcon className={cn(
									"transition-all duration-300 ease-in-out",
									isSidebarCollapsed ? "h-9 w-9" : "h-5 w-5"
								)} />
								{!isSidebarCollapsed && (
									<span className="ml-3">Settings</span>
								)}
							</Button>
						</div>
					</div>
				</aside>

				<main
					className={cn(
						"flex-1 overflow-y-auto bg-background",
						currentTrackId ? "pb-[160px] md:pb-[140px]" : "pb-16 md:pb-0"
					)}
				>
					{children}
				</main>
			</div>

			{/* Mobile Bottom Navigation */}
			<nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-sidebar/95 backdrop-blur-xl">
				<div className="flex items-center justify-around px-2 py-3">
					{navItems.map((item) => (
						<Link key={item.path} to={item.path}>
							<Button
								variant="ghost"
								size="sm"
								className={cn(
									"flex flex-col items-center gap-1 h-auto py-2 px-3",
									isActive(item.path)
										? "text-sidebar-accent-foreground"
										: "text-sidebar-foreground/70"
								)}
							>
								<item.icon
									className="h-5 w-5"
									weight={isActive(item.path) ? "fill" : "regular"}
								/>
								<span className="text-xs">{item.label}</span>
							</Button>
						</Link>
					))}
					<Button
						variant="ghost"
						size="sm"
						onClick={() => navigate({ to: "/settings" })}
						className={cn(
							"flex flex-col items-center gap-1 h-auto py-2 px-3",
							isActive("/settings")
								? "text-sidebar-accent-foreground"
								: "text-sidebar-foreground/70"
						)}
					>
						<GearIcon
							className="h-5 w-5"
							weight={isActive("/settings") ? "fill" : "regular"}
						/>
						<span className="text-xs">Settings</span>
					</Button>
				</div>
			</nav>

			<div
				className={cn(
					"fixed bottom-0 right-0 z-50 transition-all duration-200",
					"left-0 md:left-20 lg:left-64",
					!isSidebarCollapsed && "md:left-64"
				)}
			>
				<MiniPlayer />
			</div>

			<Toaster />
		</div>
	);
}
