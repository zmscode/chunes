import type { AudioEngineEvents, Track } from "@types";

export class AudioEngine {
	private audio: HTMLAudioElement;
	private context: AudioContext | null = null;
	private source: MediaElementAudioSourceNode | null = null;
	private gainNode: GainNode | null = null;
	private analyser: AnalyserNode | null = null;
	private equalizer: BiquadFilterNode[] = [];
	private eventListeners = new Map<keyof AudioEngineEvents, Set<Function>>();
	private currentTrack: Track | null = null;

	private readonly EQ_FREQUENCIES = [60, 170, 350, 1000, 3500, 10000];

	constructor() {
		this.audio = new Audio();
		this.audio.crossOrigin = "anonymous";
		this.setupEventListeners();
	}

	private setupEventListeners(): void {
		this.audio.addEventListener("play", () => this.emit("play"));
		this.audio.addEventListener("pause", () => this.emit("pause"));
		this.audio.addEventListener("ended", () => this.emit("ended"));
		this.audio.addEventListener("timeupdate", () =>
			this.emit("timeupdate", this.audio.currentTime)
		);
		this.audio.addEventListener("error", (e) =>
			this.emit(
				"error",
				new Error(
					`Audio playback error: ${e.message || "Unknown error"}`
				)
			)
		);
		this.audio.addEventListener("loadstart", () => this.emit("loadstart"));
		this.audio.addEventListener("loadeddata", () =>
			this.emit("loadeddata")
		);
		this.audio.addEventListener("volumechange", () =>
			this.emit("volumechange", this.audio.volume)
		);
	}

	private async initializeAudioContext(): Promise<void> {
		if (this.context) return;

		try {
			this.context = new (window.AudioContext ||
				(
					window as Window & {
						webkitAudioContext?: typeof AudioContext;
					}
				).webkitAudioContext)();
			this.source = this.context.createMediaElementSource(this.audio);
			this.gainNode = this.context.createGain();
			this.analyser = this.context.createAnalyser();

			this.analyser.fftSize = 2048;
			this.analyser.smoothingTimeConstant = 0.8;

			this.setupEqualizer();

			this.connectAudioGraph();
		} catch (error) {
			console.error("Failed to initialize audio context:", error);
			throw error;
		}
	}

	private setupEqualizer(): void {
		if (!this.context) return;

		this.EQ_FREQUENCIES.forEach((freq, i) => {
			const filter = this.context!.createBiquadFilter();

			if (i === 0) {
				filter.type = "lowshelf";
			} else if (i === this.EQ_FREQUENCIES.length - 1) {
				filter.type = "highshelf";
			} else {
				filter.type = "peaking";
				filter.Q.value = 1;
			}

			filter.frequency.value = freq;
			filter.gain.value = 0;

			this.equalizer.push(filter);
		});
	}

	private connectAudioGraph(): void {
		if (!this.source || !this.gainNode || !this.analyser || !this.context)
			return;

		let previousNode: AudioNode = this.source;

		for (const filter of this.equalizer) {
			previousNode.connect(filter);
			previousNode = filter;
		}

		previousNode.connect(this.gainNode);
		this.gainNode.connect(this.analyser);
		this.analyser.connect(this.context.destination);
	}

	async loadTrack(url: string, track: Track): Promise<void> {
		try {
			if (!this.context) {
				await this.initializeAudioContext();
			}

			if (this.context?.state === "suspended") {
				await this.context.resume();
			}

			this.currentTrack = track;
			this.audio.src = url;
			this.audio.load();
		} catch (error) {
			this.emit(
				"error",
				error instanceof Error
					? error
					: new Error("Failed to load track")
			);
			throw error;
		}
	}

	async play(): Promise<void> {
		try {
			if (this.context?.state === "suspended") {
				await this.context.resume();
			}
			await this.audio.play();
		} catch (error) {
			this.emit(
				"error",
				error instanceof Error ? error : new Error("Failed to play")
			);
			throw error;
		}
	}

	pause(): void {
		this.audio.pause();
	}

	stop(): void {
		this.audio.pause();
		this.audio.currentTime = 0;
	}

	seek(time: number): void {
		const clampedTime = Math.max(
			0,
			Math.min(time, this.audio.duration || 0)
		);
		this.audio.currentTime = clampedTime;
	}

	setVolume(volume: number): void {
		const clampedVolume = Math.max(0, Math.min(1, volume));
		this.audio.volume = clampedVolume;
		if (this.gainNode) {
			this.gainNode.gain.value = clampedVolume;
		}
	}

	getVolume(): number {
		return this.audio.volume;
	}

	getCurrentTime(): number {
		return this.audio.currentTime;
	}

	getDuration(): number {
		return this.audio.duration || 0;
	}

	getIsPlaying(): boolean {
		return !this.audio.paused && !this.audio.ended;
	}

	getCurrentTrack(): Track | null {
		return this.currentTrack;
	}

	setPlaybackRate(rate: number): void {
		const clampedRate = Math.max(0.25, Math.min(2, rate));
		this.audio.playbackRate = clampedRate;
	}

	setEqualizerGain(band: number, gain: number): void {
		if (band >= 0 && band < this.equalizer.length) {
			const clampedGain = Math.max(-12, Math.min(12, gain));
			this.equalizer[band].gain.value = clampedGain;
		}
	}

	getEqualizerGains(): number[] {
		return this.equalizer.map((filter) => filter.gain.value);
	}

	getVisualizerData(): Uint8Array | null {
		if (!this.analyser) return null;

		const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
		this.analyser.getByteFrequencyData(dataArray);
		return dataArray;
	}

	getWaveformData(): Uint8Array | null {
		if (!this.analyser) return null;

		const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
		this.analyser.getByteTimeDomainData(dataArray);
		return dataArray;
	}

	on<T extends keyof AudioEngineEvents>(
		event: T,
		listener: EventListener
	): void {
		if (!this.eventListeners.has(event)) {
			this.eventListeners.set(event, new Set());
		}
		this.eventListeners.get(event)!.add(listener);
	}

	off<T extends keyof AudioEngineEvents>(
		event: T,
		listener: EventListener
	): void {
		this.eventListeners.get(event)?.delete(listener);
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
		this.pause();
		this.audio.src = "";

		if (this.source) {
			this.source.disconnect();
		}

		this.equalizer.forEach((filter) => filter.disconnect());
		this.gainNode?.disconnect();
		this.analyser?.disconnect();

		if (this.context && this.context.state !== "closed") {
			this.context.close();
		}

		this.context = null;
		this.source = null;
		this.gainNode = null;
		this.analyser = null;
		this.equalizer = [];
		this.currentTrack = null;
		this.eventListeners.clear();
	}
}
