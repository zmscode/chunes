import { PlatformService } from "@types";
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

		if (isElectronEnv) {
			platformInstance = new ElectronPlatform();
		} else {
			platformInstance = new WebPlatform();
		}
	}
	return platformInstance;
};

export default getPlatformService();
