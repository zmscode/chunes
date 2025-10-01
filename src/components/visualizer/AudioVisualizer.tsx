import { useEffect, useRef, useState } from "react";
import { useVisualizer } from "@hooks/useAudioHooks";
import { useSettingsStore } from "@hooks/useStore";
import { cn } from "@utils/tailwind";
import { Button } from "@components/shadcn/button";
import { WaveformIcon, CircleIcon, ChartBarIcon } from "@phosphor-icons/react";
import { VisualizerMode } from "@types";
import { AudioVisualizerProps } from "@props";

export function AudioVisualizer({ className }: AudioVisualizerProps) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [mode, setMode] = useState<VisualizerMode>("bars");
	const { showVisualizer } = useSettingsStore();
	const { data } = useVisualizer(showVisualizer);

	useEffect(() => {
		if (!data || !canvasRef.current || !showVisualizer) return;

		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const rect = canvas.getBoundingClientRect();
		canvas.width = rect.width * window.devicePixelRatio;
		canvas.height = rect.height * window.devicePixelRatio;
		ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

		const width = rect.width;
		const height = rect.height;

		ctx.clearRect(0, 0, width, height);

		const frequencyData = data.frequency;
		const bufferLength = frequencyData.length;

		switch (mode) {
			case "bars":
				drawBars(ctx, frequencyData, bufferLength, width, height);
				break;
			case "wave":
				drawWave(ctx, data.waveform, bufferLength, width, height);
				break;
			case "circular":
				drawCircular(ctx, frequencyData, bufferLength, width, height);
				break;
		}
	}, [data, mode, showVisualizer]);

	if (!showVisualizer) {
		return null;
	}

	return (
		<div className={cn("relative", className)}>
			<div className="absolute top-4 right-4 z-10 flex gap-2">
				<Button
					size="icon"
					variant={mode === "bars" ? "default" : "outline"}
					onClick={() => setMode("bars")}
					className="h-8 w-8"
				>
					<ChartBarIcon className="h-4 w-4" />
				</Button>
				<Button
					size="icon"
					variant={mode === "wave" ? "default" : "outline"}
					onClick={() => setMode("wave")}
					className="h-8 w-8"
				>
					<WaveformIcon className="h-4 w-4" />
				</Button>
				<Button
					size="icon"
					variant={mode === "circular" ? "default" : "outline"}
					onClick={() => setMode("circular")}
					className="h-8 w-8"
				>
					<CircleIcon className="h-4 w-4" />
				</Button>
			</div>

			<canvas
				ref={canvasRef}
				className="w-full h-full"
				style={{ width: "100%", height: "100%" }}
			/>
		</div>
	);
}

function drawBars(
	ctx: CanvasRenderingContext2D,
	data: Uint8Array,
	bufferLength: number,
	width: number,
	height: number
) {
	const barCount = 64;
	const barWidth = width / barCount;
	const step = Math.floor(bufferLength / barCount);

	const gradient = ctx.createLinearGradient(0, height, 0, 0);
	gradient.addColorStop(0, "hsl(var(--primary))");
	gradient.addColorStop(0.5, "hsl(var(--primary) / 0.7)");
	gradient.addColorStop(1, "hsl(var(--primary) / 0.3)");

	ctx.fillStyle = gradient;

	for (let i = 0; i < barCount; i++) {
		const dataIndex = i * step;
		const value = data[dataIndex];
		const barHeight = (value / 255) * height * 0.8;

		const x = i * barWidth;
		const y = height - barHeight;

		ctx.beginPath();
		ctx.roundRect(x, y, barWidth - 2, barHeight, [4, 4, 0, 0]);
		ctx.fill();
	}
}

function drawWave(
	ctx: CanvasRenderingContext2D,
	data: Uint8Array,
	bufferLength: number,
	width: number,
	height: number
) {
	const sliceWidth = width / bufferLength;
	let x = 0;

	ctx.lineWidth = 2;
	ctx.strokeStyle = "hsl(var(--primary))";
	ctx.beginPath();

	for (let i = 0; i < bufferLength; i++) {
		const v = data[i] / 128.0;
		const y = (v * height) / 2;

		if (i === 0) {
			ctx.moveTo(x, y);
		} else {
			ctx.lineTo(x, y);
		}

		x += sliceWidth;
	}

	ctx.stroke();

	ctx.shadowBlur = 10;
	ctx.shadowColor = "hsl(var(--primary))";
	ctx.stroke();
	ctx.shadowBlur = 0;
}

function drawCircular(
	ctx: CanvasRenderingContext2D,
	data: Uint8Array,
	bufferLength: number,
	width: number,
	height: number
) {
	const centerX = width / 2;
	const centerY = height / 2;
	const radius = Math.min(width, height) * 0.3;
	const barCount = 64;
	const step = Math.floor(bufferLength / barCount);

	ctx.strokeStyle = "hsl(var(--primary))";
	ctx.lineWidth = 3;

	for (let i = 0; i < barCount; i++) {
		const dataIndex = i * step;
		const value = data[dataIndex];
		const barHeight = (value / 255) * radius * 0.8;

		const angle = (i / barCount) * Math.PI * 2;
		const x1 = centerX + Math.cos(angle) * radius;
		const y1 = centerY + Math.sin(angle) * radius;
		const x2 = centerX + Math.cos(angle) * (radius + barHeight);
		const y2 = centerY + Math.sin(angle) * (radius + barHeight);

		const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
		gradient.addColorStop(0, "hsl(var(--primary) / 0.3)");
		gradient.addColorStop(1, "hsl(var(--primary))");

		ctx.strokeStyle = gradient;
		ctx.beginPath();
		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.stroke();
	}

	ctx.beginPath();
	ctx.arc(centerX, centerY, radius * 0.9, 0, Math.PI * 2);
	ctx.strokeStyle = "hsl(var(--primary) / 0.5)";
	ctx.lineWidth = 2;
	ctx.stroke();
}
