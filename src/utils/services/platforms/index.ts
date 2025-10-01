import type { PlatformService } from "@types";
import { ElectronPlatform } from "./ElectronPlatform";
import { WebPlatform } from "./WebPlatform";

let platformInstance: PlatformService | null = null;

export const isElectron = (): boolean => {
	if (typeof window === "undefined") {
		return false;
	}

	if (window.musicAPI) {
		return true;
	}

	const userAgent = navigator.userAgent.toLowerCase();
	if (userAgent.indexOf(" electron/") > -1) {
		return true;
	}

	if (window.process && window.process.type === "renderer") {
		return true;
	}

	return false;
};

export const getPlatformService = (): PlatformService => {
	if (!platformInstance) {
		const isElectronEnv = isElectron();
		console.log("🔍 Platform detection:", {
			isElectron: isElectronEnv,
			hasMusicAPI: !!window.musicAPI,
			userAgent: navigator.userAgent,
		});

		if (isElectronEnv) {
			console.log("✅ Using ElectronPlatform");
			platformInstance = new ElectronPlatform();
		} else {
			console.log("✅ Using WebPlatform");
			platformInstance = new WebPlatform();
		}
	}
	return platformInstance;
};

export default getPlatformService();
