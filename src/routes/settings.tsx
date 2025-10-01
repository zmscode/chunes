import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@components/shadcn/button";
import { Slider } from "@components/shadcn/slider";
import { Separator } from "@components/shadcn/separator";
import { useSettingsStore } from "@hooks/useStore";
import { GearIcon, FolderIcon } from "@phosphor-icons/react";
import ToggleTheme from "@components/ToggleTheme";
import LangToggle from "@components/LangToggle";

function SettingsPage() {
	const { crossfadeDuration, equalizerPreset, actions } = useSettingsStore();

	return (
		<div className="flex h-full flex-col">
			{/* Header */}
			<div className="border-b p-6">
				<div className="flex items-center gap-3">
					<GearIcon className="h-8 w-8" />
					<div>
						<h1 className="text-3xl font-bold tracking-tight">
							Settings
						</h1>
						<p className="text-sm text-muted-foreground mt-1">
							Customize your music player experience
						</p>
					</div>
				</div>
			</div>

			{/* Settings Content */}
			<div className="flex-1 overflow-y-auto p-6">
				<div className="mx-auto max-w-3xl space-y-8">
					{/* Appearance */}
					<section>
						<h2 className="text-xl font-semibold mb-4">
							Appearance
						</h2>
						<div className="space-y-4 rounded-lg border p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="font-medium">Theme</p>
									<p className="text-sm text-muted-foreground">
										Choose your preferred theme
									</p>
								</div>
								<ToggleTheme />
							</div>
							<Separator />
							<div className="flex items-center justify-between">
								<div>
									<p className="font-medium">Language</p>
									<p className="text-sm text-muted-foreground">
										Select your language
									</p>
								</div>
								<LangToggle />
							</div>
						</div>
					</section>

					{/* Playback */}
					<section>
						<h2 className="text-xl font-semibold mb-4">Playback</h2>
						<div className="space-y-4 rounded-lg border p-4">
							<div>
								<div className="mb-4">
									<p className="font-medium">
										Crossfade Duration
									</p>
									<p className="text-sm text-muted-foreground">
										Smoothly transition between tracks
									</p>
								</div>
								<div className="flex items-center gap-4">
									<Slider
										value={[crossfadeDuration]}
										onValueChange={([value]) =>
											actions.setCrossfadeDuration(value)
										}
										max={10}
										step={0.5}
										className="flex-1"
									/>
									<span className="text-sm font-medium w-16 text-right">
										{crossfadeDuration.toFixed(1)}s
									</span>
								</div>
							</div>
							<Separator />
							<div className="flex items-center justify-between">
								<div>
									<p className="font-medium">
										Equalizer Preset
									</p>
									<p className="text-sm text-muted-foreground">
										Current: {equalizerPreset}
									</p>
								</div>
								<Button variant="outline" size="sm">
									Configure
								</Button>
							</div>
						</div>
					</section>

					{/* Library */}
					<section>
						<h2 className="text-xl font-semibold mb-4">Library</h2>
						<div className="space-y-4 rounded-lg border p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="font-medium">Music Folder</p>
									<p className="text-sm text-muted-foreground">
										Manage your music library location
									</p>
								</div>
								<Button variant="outline" size="sm">
									<FolderIcon className="h-4 w-4 mr-2" />
									Change
								</Button>
							</div>
						</div>
					</section>

					{/* About */}
					<section>
						<h2 className="text-xl font-semibold mb-4">About</h2>
						<div className="rounded-lg border p-4">
							<div className="space-y-2">
								<p className="font-medium">
									Chunes Music Player
								</p>
								<p className="text-sm text-muted-foreground">
									Version 1.0.0
								</p>
								<p className="text-sm text-muted-foreground">
									Built with React, Electron, and TanStack
								</p>
							</div>
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}

export const Route = createFileRoute("/settings")({
	component: SettingsPage,
});
