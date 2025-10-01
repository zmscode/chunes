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
import LiquidGlass from "liquid-glass-react";

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
		<div className="flex h-screen flex-col overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
			<DragWindowRegion title="Chunes Music Player" />

			<div className="flex flex-1 overflow-hidden">
				<LiquidGlass
					displacementScale={45}
					blurAmount={0.35}
					saturation={108}
					aberrationIntensity={1.6}
					elasticity={0.25}
					cornerRadius={0}
					style={{
						width: isSidebarCollapsed ? "64px" : "256px",
						transition: "width 0.3s ease",
						borderRight: "1px solid rgba(255, 255, 255, 0.1)",
						background: "rgba(0, 0, 0, 0.3)",
					}}
				>
					<aside className="flex flex-col h-full">
						<div className="flex-1 overflow-y-auto p-4">
							<nav className="space-y-1">
								{navItems.map((item) => (
									<Link key={item.path} to={item.path}>
										<LiquidGlass
											displacementScale={
												isActive(item.path) ? 35 : 25
											}
											blurAmount={
												isActive(item.path) ? 0.3 : 0.2
											}
											saturation={
												isActive(item.path) ? 115 : 105
											}
											elasticity={0.3}
											cornerRadius={8}
											style={{
												marginBottom: "4px",
												background: isActive(item.path)
													? "rgba(255, 255, 255, 0.15)"
													: "transparent",
											}}
										>
											<Button
												variant="ghost"
												className={cn(
													"w-full justify-start bg-transparent border-0",
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
										</LiquidGlass>
									</Link>
								))}
							</nav>

							{!isSidebarCollapsed && (
								<>
									<Separator className="my-4 bg-white/10" />

									<div>
										<h3 className="mb-2 px-2 text-sm font-semibold text-white/70 uppercase tracking-wide">
											Collection
										</h3>
										<nav className="space-y-1">
											{collectionItems.map((item) => (
												<Link
													key={item.path}
													to={item.path}
												>
													<LiquidGlass
														displacementScale={
															isActive(item.path)
																? 35
																: 25
														}
														blurAmount={
															isActive(item.path)
																? 0.3
																: 0.2
														}
														saturation={
															isActive(item.path)
																? 115
																: 105
														}
														elasticity={0.3}
														cornerRadius={8}
														style={{
															marginBottom: "4px",
															background:
																isActive(
																	item.path
																)
																	? "rgba(255, 255, 255, 0.15)"
																	: "transparent",
														}}
													>
														<Button
															variant="ghost"
															className="w-full justify-start bg-transparent border-0"
														>
															<item.icon className="h-5 w-5" />
															<span className="ml-3">
																{item.label}
															</span>
														</Button>
													</LiquidGlass>
												</Link>
											))}
										</nav>
									</div>
								</>
							)}
						</div>

						<div className="border-t border-white/10 p-4 space-y-2">
							<FullscreenVisualizer
								trigger={
									<DialogTrigger asChild>
										<LiquidGlass
											displacementScale={30}
											blurAmount={0.25}
											saturation={110}
											elasticity={0.35}
											cornerRadius={8}
											style={{
												cursor: "pointer",
												width: "100%",
											}}
										>
											<Button
												variant="ghost"
												className={cn(
													"w-full justify-start bg-transparent border-0",
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
										</LiquidGlass>
									</DialogTrigger>
								}
							/>

							<Link to="/settings">
								<LiquidGlass
									displacementScale={
										isActive("/settings") ? 35 : 25
									}
									blurAmount={
										isActive("/settings") ? 0.3 : 0.2
									}
									saturation={
										isActive("/settings") ? 115 : 105
									}
									elasticity={0.3}
									cornerRadius={8}
									style={{
										background: isActive("/settings")
											? "rgba(255, 255, 255, 0.15)"
											: "transparent",
									}}
								>
									<Button
										variant="ghost"
										className={cn(
											"w-full justify-start bg-transparent border-0",
											isSidebarCollapsed &&
												"justify-center px-2"
										)}
									>
										<GearIcon className="h-5 w-5" />
										{!isSidebarCollapsed && (
											<span className="ml-3">
												Settings
											</span>
										)}
									</Button>
								</LiquidGlass>
							</Link>
						</div>
					</aside>
				</LiquidGlass>

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
					<div className="h-24 border-t">
						<AudioVisualizer className="h-full" />
					</div>
				)}
				<MiniPlayer />
			</div>

			<Toaster />
		</div>
	);
}
