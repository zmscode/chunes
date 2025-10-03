import { LyricLine, ParsedLyrics } from "@types";
import { Lyrics } from "paroles";

export class LyricsParser {
	static parse(content: string): ParsedLyrics {
		try {
			const lyrics = new Lyrics(content);

			const lines: LyricLine[] = lyrics.lines.map((line: any) => ({
				time: line.time,
				text: line.text || "",
			}));

			const metadata: ParsedLyrics["metadata"] = {
				title: lyrics.info.title,
				artist: lyrics.info.artist,
				album: lyrics.info.album,
				offset: lyrics.info.offset,
			};

			return { lines, metadata };
		} catch (error) {
			return { lines: [], metadata: {} };
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
