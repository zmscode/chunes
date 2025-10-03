import { LyricLine, ParsedLyrics } from "@types";

export class LyricsParser {
	static parse(content: string): ParsedLyrics {
		const lines: LyricLine[] = [];
		const metadata: ParsedLyrics["metadata"] = {};

		const textLines = content.split("\n");
		console.log("🎵 Parser: Processing", textLines.length, "lines");

		for (const line of textLines) {
			const trimmed = line.trim();
			if (!trimmed) continue;

			const metadataMatch = trimmed.match(/^\[([a-zA-Z]+):([^\]]+)\]/);
			if (metadataMatch) {
				const [, key, value] = metadataMatch;
				console.log("🎵 Parser: Found metadata:", key, "=", value);
				this.parseMetadata(key.toLowerCase(), value, metadata);
				continue;
			}

			const regex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g;
			const matches = Array.from(trimmed.matchAll(regex));
			console.log("🎵 Parser line:", trimmed.substring(0, 50), "| Matches:", matches.length, "| Regex:", regex.toString());

			if (matches.length > 0) {
				const lastMatch = matches[matches.length - 1];
				const text = trimmed
					.substring(lastMatch.index! + lastMatch[0].length)
					.trim();

				for (const match of matches) {
					const minutes = parseInt(match[1], 10);
					const seconds = parseInt(match[2], 10);
					const centiseconds = match[3]
						? parseInt(match[3].padEnd(2, "0").substring(0, 2), 10)
						: 0;

					const time = minutes * 60 + seconds + centiseconds / 100;

					lines.push({
						time,
						text,
					});
				}
			}
		}

		lines.sort((a, b) => a.time - b.time);

		if (metadata.offset) {
			const offsetSeconds = metadata.offset / 1000;
			lines.forEach((line) => {
				line.time += offsetSeconds;
			});
		}

		return { lines, metadata };
	}

	private static parseMetadata(
		key: string,
		value: string,
		metadata: ParsedLyrics["metadata"]
	): void {
		switch (key) {
			case "ti":
				metadata.title = value;
				break;
			case "ar":
				metadata.artist = value;
				break;
			case "al":
				metadata.album = value;
				break;
			case "by":
				metadata.by = value;
				break;
			case "offset":
				metadata.offset = parseInt(value, 10);
				break;
		}
	}

	static getCurrentLine(
		lyrics: ParsedLyrics,
		currentTime: number
	): { current: LyricLine | null; index: number } {
		if (lyrics.lines.length === 0) {
			return { current: null, index: -1 };
		}

		let currentIndex = -1;
		for (let i = lyrics.lines.length - 1; i >= 0; i--) {
			if (lyrics.lines[i].time <= currentTime) {
				currentIndex = i;
				break;
			}
		}

		return {
			current: currentIndex >= 0 ? lyrics.lines[currentIndex] : null,
			index: currentIndex,
		};
	}

	static getLyricsWindow(
		lyrics: ParsedLyrics,
		currentTime: number,
		linesBefore: number = 2,
		linesAfter: number = 3
	): {
		lines: Array<LyricLine & { index: number; isCurrent: boolean }>;
		currentIndex: number;
	} {
		const { index: currentIndex } = this.getCurrentLine(
			lyrics,
			currentTime
		);

		const start = Math.max(0, currentIndex - linesBefore);
		const end = Math.min(
			lyrics.lines.length,
			currentIndex + linesAfter + 1
		);

		const lines = lyrics.lines.slice(start, end).map((line, i) => ({
			...line,
			index: start + i,
			isCurrent: start + i === currentIndex,
		}));

		return { lines, currentIndex };
	}

	static formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
	}

	static validate(content: string): boolean {
		const timestampRegex = /\[\d{2}:\d{2}\.?\d{0,3}\]/;
		return timestampRegex.test(content);
	}
}
