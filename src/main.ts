// src/main.ts
import { app, BrowserWindow, protocol } from "electron";
import registerListeners from "./utils/helpers/ipc/listeners-register";
import path from "path";
import {
	installExtension,
	REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";
import { readFile } from "fs/promises";

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
			webSecurity: false, // Allow loading local files
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
	} catch {
		console.error("Failed to install extensions");
	}
}

app.whenReady().then(async () => {
	// Register file protocol handler
	protocol.handle("file", async (request) => {
		const filePath = decodeURIComponent(request.url.replace("file://", ""));
		console.log("Loading file:", filePath);

		try {
			const data = await readFile(filePath);
			const ext = path.extname(filePath).toLowerCase();

			const mimeTypes: Record<string, string> = {
				".mp3": "audio/mpeg",
				".m4a": "audio/mp4",
				".aac": "audio/aac",
				".ogg": "audio/ogg",
				".opus": "audio/opus",
				".wav": "audio/wav",
				".flac": "audio/flac",
			};

			const mimeType = mimeTypes[ext] || "audio/mpeg";

			return new Response(data, {
				headers: {
					"Content-Type": mimeType,
					"Content-Length": data.length.toString(),
					"Accept-Ranges": "bytes",
				},
			});
		} catch (error) {
			console.error("Error loading file:", error);
			return new Response("File not found", { status: 404 });
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
