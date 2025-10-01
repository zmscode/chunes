// src/main.ts
import { app, BrowserWindow, protocol } from "electron";
import registerListeners from "./utils/helpers/ipc/listeners-register";
import path from "path";
import {
	installExtension,
	REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";
import { readFile, stat } from "fs/promises";

const inDevelopment = process.env.NODE_ENV === "development";

let mainWindow: BrowserWindow | null = null;

// Register file protocol before app is ready
protocol.registerSchemesAsPrivileged([
	{
		scheme: "file",
		privileges: {
			secure: true,
			supportFetchAPI: true,
			bypassCSP: true,
			stream: true,
			standard: true,
			corsEnabled: true,
		},
	},
]);

function createWindow() {
	const preload = path.join(__dirname, "preload.js");
	mainWindow = new BrowserWindow({
		width: 1200,
		height: 800,
		webPreferences: {
			devTools: inDevelopment,
			contextIsolation: true,
			nodeIntegration: false,
			nodeIntegrationInSubFrames: false,
			sandbox: false, // Disable sandbox for file access
			webSecurity: true,
			preload: preload,
		},
		titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "hidden",
		trafficLightPosition:
			process.platform === "darwin" ? { x: 5, y: 5 } : undefined,
	});

	if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
		mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
	} else {
		mainWindow.loadFile(
			path.join(
				__dirname,
				`../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`
			)
		);
	}

	mainWindow.on("closed", () => {
		mainWindow = null;
	});

	// Open DevTools in development
	if (inDevelopment) {
		mainWindow.webContents.openDevTools();
	}
}

async function installExtensions() {
	try {
		const result = await installExtension(REACT_DEVELOPER_TOOLS);
		console.log(`Extensions installed successfully: ${result.name}`);
	} catch (err) {
		console.error("Failed to install extensions:", err);
	}
}

app.whenReady().then(async () => {
	// Register file protocol handler with enhanced error handling and MIME types
	protocol.handle("file", async (request) => {
		try {
			// Parse the URL and decode it
			const url = new URL(request.url);
			let filePath = decodeURIComponent(url.pathname);

			// Handle Windows paths (remove leading slash from /C:/...)
			if (process.platform === "win32" && /^\/[a-zA-Z]:/.test(filePath)) {
				filePath = filePath.substring(1);
			}

			console.log("📁 File protocol request:", {
				original: request.url,
				decoded: filePath,
				platform: process.platform,
			});

			// Check if file exists and get stats
			const fileStats = await stat(filePath);
			if (!fileStats.isFile()) {
				console.error("❌ Not a file:", filePath);
				return new Response("Not a file", { status: 400 });
			}

			// Read the file
			const data = await readFile(filePath);
			const ext = path.extname(filePath).toLowerCase();

			const mimeTypes: Record<string, string> = {
				".mp3": "audio/mpeg",
				".m4a": "audio/mp4",
				".aac": "audio/aac",
				".ogg": "audio/ogg",
				".opus": "audio/opus",
				".wav": "audio/wav",
				".wave": "audio/wav",
				".flac": "audio/flac",
				".wma": "audio/x-ms-wma",
				".webm": "audio/webm",
			};

			const mimeType = mimeTypes[ext] || "application/octet-stream";

			console.log("✅ File loaded successfully:", {
				path: filePath,
				size: data.length,
				mimeType: mimeType,
				extension: ext,
			});

			const arrayBuffer = data.buffer.slice(
				data.byteOffset,
				data.byteOffset + data.byteLength
			);

			return new Response(arrayBuffer as BodyInit, {
				status: 200,
				headers: {
					"Content-Type": mimeType,
					"Content-Length": data.length.toString(),
					"Accept-Ranges": "bytes",
					"Access-Control-Allow-Origin": "*",
					"Cache-Control": "no-cache",
				},
			});
		} catch (error) {
			console.error("❌ Error loading file:", error);
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error";
			return new Response(`File not found: ${errorMessage}`, {
				status: 404,
				headers: {
					"Content-Type": "text/plain",
				},
			});
		}
	});

	registerListeners(() => mainWindow);
	createWindow();

	if (inDevelopment) {
		await installExtensions();
	}
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow();
	}
});
