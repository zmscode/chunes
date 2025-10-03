import { Howl, Howler } from "howler";
import type {
	AudioEngineConfig,
	Track,
	AudioEngineEvents,
	EventListener,
	EqualizerBand,
} from "@types";

export class AudioEngine {
	private currentHowl: Howl | null = null;
	private nextHowl: Howl | null = null;
	private currentTrack: Track | null = null;
	private nextTrack: Track | null = null;

	private audioContext: AudioContext | null = null;
	private analyser: AnalyserNode | null = null;
	private gainNode: GainNode | null = null;
	private equalizer: BiquadFilterNode[] = [];

	private eventListeners = new Map<
		keyof AudioEngineEvents,
		Set<EventListener<keyof AudioEngineEvents>>
	>();
	private isInitialized = false;
	private currentVolume = 1;
	private isCrossfading = false;
	private crossfadeTimer: number | null = null;

	private readonly EQ_BANDS: EqualizerBand[] = [
		{ frequency: 60, gain: 0, type: "lowshelf" },
		{ frequency: 170, gain: 0, type: "peaking" },
		{ frequency: 350, gain: 0, type: "peaking" },
		{ frequency: 1000, gain: 0, type: "peaking" },
		{ frequency: 3500, gain: 0, type: "peaking" },
		{ frequency: 10000, gain: 0, type: "highshelf" },
	];

	constructor(private config: AudioEngineConfig = {}) {
		this.config = {
			crossfadeDuration: 0,
			preloadNext: true,
			volumeFadeTime: 200,
			autoUnlock: true,
			...config,
		};

		if (this.config.autoUnlock) {
			this.setupAutoUnlock();
		}
	}

	private setupAutoUnlock(): void {
		Howler.autoUnlock = true;
	}

	async initialize(): Promise<void> {
		if (this.isInitialized) return;

		try {
			if ("AudioContext" in window || "webkitAudioContext" in window) {
				const AudioContextClass =
					(window as any).AudioContext ||
					(window as any).webkitAudioContext;
				this.audioContext = new AudioContextClass();

				this.analyser = this.audioContext!.createAnalyser();
				this.analyser.fftSize = 2048;
				this.analyser.smoothingTimeConstant = 0.8;

				this.gainNode = this.audioContext!.createGain();
				this.gainNode.gain.value = this.currentVolume;

				this.setupEqualizer();

				this.connectAudioGraph();
			}

			this.isInitialized = true;
			this.emit("initialized");
		} catch (error) {
			const audioError =
				error instanceof Error
					? error
					: new Error("Failed to initialize audio engine");
			this.emit("error", audioError);
			throw audioError;
		}
	}

	private setupEqualizer(): void {
		if (!this.audioContext) return;

		this.EQ_BANDS.forEach((band) => {
			const filter = this.audioContext!.createBiquadFilter();
			filter.type = band.type;
			filter.frequency.value = band.frequency;
			filter.gain.value = band.gain;

			if (band.type === "peaking") {
				filter.Q.value = 1;
			}

			this.equalizer.push(filter);
		});
	}

	private connectAudioGraph(): void {
		if (!this.audioContext || !this.gainNode || !this.analyser) return;

		let previousNode: AudioNode = this.equalizer[0];

		for (let i = 1; i < this.equalizer.length; i++) {
			previousNode.connect(this.equalizer[i]);
			previousNode = this.equalizer[i];
		}

		if (this.equalizer.length > 0) {
			previousNode.connect(this.gainNode);
		}

		this.gainNode.connect(this.analyser);
		this.analyser.connect(this.audioContext.destination);
	}

	async loadTrack(url: string, track: Track): Promise<void> {
		try {
			if (!this.isInitialized) {
				await this.initialize();
			}

			if (this.audioContext?.state === "suspended") {
				await this.audioContext.resume();
			}

			if (this.currentHowl) {
				this.currentHowl.stop();
				this.currentHowl.unload();
				this.currentHowl = null;
			}

			if (this.timeUpdateInterval) {
				clearInterval(this.timeUpdateInterval);
				this.timeUpdateInterval = null;
			}

			this.currentTrack = track;

			const format = this.getFormatFromFilepath(track.filepath);

			this.currentHowl = new Howl({
				src: [url],
				format: format,
				html5: track.duration > 300,
				volume: this.currentVolume,

				onplay: () => this.emit("play"),
				onpause: () => this.emit("pause"),
				onend: () => this.emit("ended"),
				onstop: () => this.emit("stopped"),
				onseek: () => this.emit("seeked"),
				onload: () => {
					this.emit("loadeddata");
					if (this.currentHowl) {
						const duration = this.currentHowl.duration();
						this.emit("durationchange", duration);

						this.connectAnalyserToHowler();

						setTimeout(() => {
							this.connectAnalyserToHowler();
						}, 100);
					}
				},
				onloaderror: (_id: number, error: any) => {
					this.emit(
						"error",
						new Error(`Failed to load track: ${error}`)
					);
				},
				onplayerror: (_id: number, error: any) => {
					this.emit(
						"error",
						new Error(`Failed to play track: ${error}`)
					);
				},
			});

			this.setupTimeUpdate();
			this.emit("loadstart");
		} catch (error) {
			const audioError =
				error instanceof Error
					? error
					: new Error("Failed to load track");
			this.emit("error", audioError);
			throw audioError;
		}
	}

	private connectAnalyserToHowler(): void {
		if (!this.currentHowl || !this.audioContext || !this.analyser) {
			return;
		}

		try {
			const sound = (this.currentHowl as any)._sounds[0];
			if (!sound) {
				return;
			}

			const isHTML5 = sound._node && sound._node.tagName === "AUDIO";

			if (isHTML5) {
				const audioElement = sound._node as HTMLAudioElement;

				if (!(audioElement as any)._mediaElementSource) {
					const source =
						this.audioContext!.createMediaElementSource(
							audioElement
						);
					(audioElement as any)._mediaElementSource = source;

					if (this.equalizer.length > 0) {
						source.connect(this.equalizer[0]);
					} else {
						source.connect(this.analyser!);
					}
				}
			} else if (sound._node && sound._node.sourceNode) {
				try {
					sound._node.sourceNode.disconnect();
				} catch {}

				if (this.equalizer.length > 0) {
					sound._node.sourceNode.connect(this.equalizer[0]);
				} else {
					sound._node.sourceNode.connect(this.analyser);
				}
			}
		} catch {}
	}

	private getFormatFromFilepath(filepath: string): string[] {
		const extension = filepath.split(".").pop()?.toLowerCase();
		const formatMap: Record<string, string[]> = {
			mp3: ["mp3", "mpeg"],
			m4a: ["m4a", "mp4", "aac"],
			ogg: ["ogg", "oga"],
			opus: ["opus", "ogg"],
			wav: ["wav"],
			flac: ["flac"],
			webm: ["webm"],
			aac: ["aac"],
			wma: ["wma"],
		};

		return formatMap[extension || ""] || ["mp3"];
	}

	private getFormatFromUrl(url: string): string[] {
		const extension = url.split(".").pop()?.toLowerCase();
		return this.getFormatFromFilepath(extension || "");
	}

	private timeUpdateInterval: number | null = null;

	private setupTimeUpdate(): void {
		if (this.timeUpdateInterval) {
			clearInterval(this.timeUpdateInterval);
		}

		this.timeUpdateInterval = window.setInterval(() => {
			if (this.currentHowl && this.currentHowl.playing()) {
				const currentTime = this.currentHowl.seek() as number;
				this.emit("timeupdate", currentTime);
			}
		}, 100);
	}

	async play(): Promise<void> {
		try {
			if (this.audioContext?.state === "suspended") {
				await this.audioContext.resume();
			}

			if (this.currentHowl) {
				this.currentHowl.play();

				setTimeout(() => {
					this.connectAnalyserToHowler();
				}, 50);
			}
		} catch (error) {
			const audioError =
				error instanceof Error ? error : new Error("Failed to play");
			this.emit("error", audioError);
			throw audioError;
		}
	}

	pause(): void {
		if (this.currentHowl) {
			this.currentHowl.pause();
		}
	}

	stop(): void {
		if (this.currentHowl) {
			this.currentHowl.stop();
			this.emit("stopped");
		}
	}

	seek(time: number): void {
		if (this.currentHowl) {
			const duration = this.currentHowl.duration();
			const clampedTime = Math.max(0, Math.min(time, duration));
			this.currentHowl.seek(clampedTime);
		}
	}

	setVolume(volume: number, fade: boolean = false): void {
		const clampedVolume = Math.max(0, Math.min(1, volume));
		this.currentVolume = clampedVolume;

		if (this.currentHowl) {
			if (fade && this.config.volumeFadeTime) {
				this.currentHowl.fade(
					this.currentHowl.volume(),
					clampedVolume,
					this.config.volumeFadeTime
				);
			} else {
				this.currentHowl.volume(clampedVolume);
			}
		}

		if (this.gainNode) {
			this.gainNode.gain.value = clampedVolume;
		}

		this.emit("volumechange", clampedVolume);
	}

	getVolume(): number {
		return this.currentVolume;
	}

	getCurrentTime(): number {
		if (this.currentHowl) {
			return this.currentHowl.seek() as number;
		}
		return 0;
	}

	getDuration(): number {
		if (this.currentHowl) {
			return this.currentHowl.duration();
		}
		return 0;
	}

	getIsPlaying(): boolean {
		return this.currentHowl ? this.currentHowl.playing() : false;
	}

	getCurrentTrack(): Track | null {
		return this.currentTrack;
	}

	setPlaybackRate(rate: number): void {
		const clampedRate = Math.max(0.25, Math.min(2, rate));
		if (this.currentHowl) {
			this.currentHowl.rate(clampedRate);
		}
	}

	setEqualizerGain(band: number, gain: number): void {
		if (band >= 0 && band < this.equalizer.length) {
			const clampedGain = Math.max(-12, Math.min(12, gain));
			this.equalizer[band].gain.value = clampedGain;
			this.EQ_BANDS[band].gain = clampedGain;
		}
	}

	getEqualizerGains(): number[] {
		return this.EQ_BANDS.map((band) => band.gain);
	}

	resetEqualizer(): void {
		this.equalizer.forEach((filter, index) => {
			filter.gain.value = 0;
			this.EQ_BANDS[index].gain = 0;
		});
	}

	applyEqualizerPreset(preset: "flat" | "bass" | "vocal" | "treble"): void {
		const presets: Record<string, number[]> = {
			flat: [0, 0, 0, 0, 0, 0],
			bass: [6, 4, 2, 0, -2, -4],
			vocal: [-2, 0, 2, 4, 2, 0],
			treble: [-4, -2, 0, 2, 4, 6],
		};

		const gains = presets[preset] || presets.flat;
		gains.forEach((gain, index) => {
			this.setEqualizerGain(index, gain);
		});
	}

	async preloadNextTrack(url: string, track: Track): Promise<void> {
		if (!this.config.preloadNext) return;

		try {
			this.nextTrack = track;
			this.nextHowl = new Howl({
				src: [url],
				format: this.getFormatFromUrl(url),
				html5: track.duration > 300,
				preload: true,
				volume: 0,
			});
		} catch {}
	}

	async crossfadeToNext(duration?: number): Promise<void> {
		if (!this.nextHowl || !this.currentHowl || this.isCrossfading) return;

		this.isCrossfading = true;
		const crossfadeDuration =
			duration || this.config.crossfadeDuration || 2000;

		this.nextHowl.volume(0);
		this.nextHowl.play();

		this.currentHowl.fade(this.currentVolume, 0, crossfadeDuration);
		this.nextHowl.fade(0, this.currentVolume, crossfadeDuration);

		this.crossfadeTimer = window.setTimeout(() => {
			if (this.currentHowl) {
				this.currentHowl.stop();
				this.currentHowl.unload();
			}

			this.currentHowl = this.nextHowl;
			this.currentTrack = this.nextTrack;
			this.nextHowl = null;
			this.nextTrack = null;

			this.isCrossfading = false;
			this.setupTimeUpdate();

			this.emit("crossfaded");
		}, crossfadeDuration);
	}

	on<T extends keyof AudioEngineEvents>(
		event: T,
		listener: EventListener<T>
	): void {
		if (!this.eventListeners.has(event)) {
			this.eventListeners.set(event, new Set());
		}
		this.eventListeners
			.get(event)!
			.add(listener as EventListener<keyof AudioEngineEvents>);
	}

	off<T extends keyof AudioEngineEvents>(
		event: T,
		listener: EventListener<T>
	): void {
		this.eventListeners
			.get(event)
			?.delete(listener as EventListener<keyof AudioEngineEvents>);
	}

	private emit<T extends keyof AudioEngineEvents>(
		event: T,
		...args: Parameters<AudioEngineEvents[T]>
	): void {
		this.eventListeners.get(event)?.forEach((listener) => {
			(listener as Function)(...args);
		});
	}

	destroy(): void {
		if (this.currentHowl) {
			this.currentHowl.stop();
			this.currentHowl.unload();
			this.currentHowl = null;
		}

		if (this.nextHowl) {
			this.nextHowl.stop();
			this.nextHowl.unload();
			this.nextHowl = null;
		}

		if (this.timeUpdateInterval) {
			clearInterval(this.timeUpdateInterval);
			this.timeUpdateInterval = null;
		}

		if (this.crossfadeTimer) {
			clearTimeout(this.crossfadeTimer);
			this.crossfadeTimer = null;
		}

		this.equalizer.forEach((filter) => filter.disconnect());
		this.gainNode?.disconnect();
		this.analyser?.disconnect();

		if (this.audioContext && this.audioContext.state !== "closed") {
			this.audioContext.close();
		}

		this.audioContext = null;
		this.analyser = null;
		this.gainNode = null;
		this.equalizer = [];
		this.currentTrack = null;
		this.nextTrack = null;
		this.eventListeners.clear();

		Howler.unload();
	}
}

export const audioEngine = new AudioEngine({
	crossfadeDuration: 2000,
	preloadNext: true,
	volumeFadeTime: 200,
	autoUnlock: true,
});
