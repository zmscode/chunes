import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@components/shadcn/button";
import { Slider } from "@components/shadcn/slider";
import { Separator } from "@components/shadcn/separator";
import { Label } from "@components/shadcn/label";
import { Switch } from "@components/shadcn/switch";
import { Input } from "@components/shadcn/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@components/shadcn/select";
import { useSettingsStore, useLibraryStats } from "@hooks/useStore";
import { useEqualizer } from "@hooks/useAudioHooks";
import { GearIcon } from "@phosphor-icons/react";
import ToggleTheme from "@components/ToggleTheme";
import LangToggle from "@components/LangToggle";
import { LibraryScanner } from "@components/scanner/LibraryScanner";
import { formatTime } from "@hooks/useAudioHooks";
import { AppleMusicService } from "@services/artwork/AppleMusicService";
import { toast } from "sonner";

function SettingsPage() {
	const { crossfadeDuration, equalizerPreset, showLyrics, actions } =
		useSettingsStore();
	const equalizer = useEqualizer();
	const libraryStats = useLibraryStats();
	const [appleMusicToken, setAppleMusicToken] = useState("");

	const handleSaveToken = () => {
		if (appleMusicToken.trim()) {
			AppleMusicService.setDeveloperToken(appleMusicToken.trim());
			AppleMusicService.clearCache();
			toast.success(
				"Apple Music token saved! Artist images will now use the official API."
			);
			setAppleMusicToken("");
		}
	};

	return (
		<div className="flex h-full flex-col">
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

			<div className="flex-1 overflow-y-auto p-6">
				<div className="mx-auto max-w-3xl space-y-8">
					<section>
						<h2 className="text-xl font-semibold mb-4">
							Library Statistics
						</h2>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							<div className="rounded-lg border p-4">
								<div className="text-2xl font-bold text-primary">
									{libraryStats.totalTracks}
								</div>
								<div className="text-sm text-muted-foreground">
									Tracks
								</div>
							</div>
							<div className="rounded-lg border p-4">
								<div className="text-2xl font-bold text-primary">
									{libraryStats.totalAlbums}
								</div>
								<div className="text-sm text-muted-foreground">
									Albums
								</div>
							</div>
							<div className="rounded-lg border p-4">
								<div className="text-2xl font-bold text-primary">
									{libraryStats.totalArtists}
								</div>
								<div className="text-sm text-muted-foreground">
									Artists
								</div>
							</div>
							<div className="rounded-lg border p-4">
								<div className="text-2xl font-bold text-primary">
									{formatTime(libraryStats.totalDuration)}
								</div>
								<div className="text-sm text-muted-foreground">
									Total Time
								</div>
							</div>
						</div>
					</section>

					<section>
						<h2 className="text-xl font-semibold mb-4">
							Appearance
						</h2>
						<div className="space-y-4 rounded-lg border p-6">
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label className="text-base">Theme</Label>
									<div className="text-sm text-muted-foreground">
										Choose your preferred color scheme
									</div>
								</div>
								<ToggleTheme />
							</div>

							<Separator />

							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label className="text-base">
										Language
									</Label>
									<div className="text-sm text-muted-foreground">
										Select your preferred language
									</div>
								</div>
								<LangToggle />
							</div>

							<Separator />

							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label
										htmlFor="lyrics"
										className="text-base"
									>
										Show Lyrics
									</Label>
									<div className="text-sm text-muted-foreground">
										Display synced lyrics when available
									</div>
								</div>
								<Switch
									id="lyrics"
									checked={showLyrics}
									onCheckedChange={actions.toggleLyrics}
								/>
							</div>

							<Separator />
						</div>
					</section>

					<section>
						<h2 className="text-xl font-semibold mb-4">Playback</h2>
						<div className="space-y-6 rounded-lg border p-6">
							<div>
								<div className="flex items-center justify-between mb-4">
									<Label className="text-base">
										Crossfade Duration
									</Label>
									<span className="text-sm font-medium">
										{crossfadeDuration.toFixed(1)}s
									</span>
								</div>
								<Slider
									value={[crossfadeDuration]}
									onValueChange={([value]) =>
										actions.setCrossfadeDuration(value)
									}
									max={10}
									step={0.5}
									className="w-full"
								/>
								<p className="text-sm text-muted-foreground mt-2">
									Smoothly transition between tracks
								</p>
							</div>

							<Separator />

							<div>
								<Label className="text-base mb-4 block">
									Equalizer
								</Label>
								<div className="space-y-4">
									<Select
										value={equalizerPreset}
										onValueChange={
											actions.setEqualizerPreset
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select preset" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="flat">
												Flat
											</SelectItem>
											<SelectItem value="bass">
												Bass Boost
											</SelectItem>
											<SelectItem value="vocal">
												Vocal
											</SelectItem>
											<SelectItem value="treble">
												Treble
											</SelectItem>
										</SelectContent>
									</Select>

									<div className="grid grid-cols-6 gap-2">
										{equalizer.bands.map((band, index) => (
											<div
												key={band.frequency}
												className="space-y-2"
											>
												<div className="flex flex-col items-center">
													<Slider
														value={[band.gain + 12]}
														onValueChange={([
															value,
														]) =>
															equalizer.setGain(
																index,
																value - 12
															)
														}
														max={24}
														step={1}
														orientation="vertical"
														className="h-24"
													/>
													<span className="text-xs text-muted-foreground mt-2">
														{band.label}
													</span>
													<span className="text-xs font-mono">
														{band.gain > 0
															? "+"
															: ""}
														{band.gain.toFixed(0)}
													</span>
												</div>
											</div>
										))}
									</div>

									<Button
										variant="outline"
										size="sm"
										onClick={equalizer.reset}
										className="w-full"
									>
										Reset Equalizer
									</Button>
								</div>
							</div>
						</div>
					</section>

					<section>
						<h2 className="text-xl font-semibold mb-4">Library</h2>
						<div className="space-y-4 rounded-lg border p-6">
							<div className="flex items-center justify-between">
								<div className="space-y-0.5">
									<Label className="text-base">
										Music Folder
									</Label>
									<div className="text-sm text-muted-foreground">
										Scan your music library
									</div>
								</div>
								<LibraryScanner />
							</div>
						</div>
					</section>

					<section>
						<h2 className="text-xl font-semibold mb-4">
							Apple Music Integration
						</h2>
						<div className="space-y-4 rounded-lg border p-6">
							<div>
								<Label
									htmlFor="apple-music-token"
									className="text-base"
								>
									Developer Token
								</Label>
								<div className="text-sm text-muted-foreground mb-3">
									Add your Apple Music API developer token to
									get high-quality artist images.{" "}
									<a
										href="https://developer.apple.com/documentation/applemusicapi/generating-developer-tokens"
										target="_blank"
										rel="noopener noreferrer"
										className="underline hover:text-foreground"
									>
										Learn how to generate one
									</a>
								</div>
								<div className="flex gap-2">
									<Input
										id="apple-music-token"
										type="password"
										placeholder="Paste your developer token here"
										value={appleMusicToken}
										onChange={(e) =>
											setAppleMusicToken(e.target.value)
										}
										className="font-mono text-xs"
									/>
									<Button
										onClick={handleSaveToken}
										disabled={!appleMusicToken.trim()}
									>
										Save Token
									</Button>
								</div>
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
