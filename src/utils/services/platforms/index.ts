import type { PlatformService } from "./PlatformService";
import { ElectronPlatform } from "./ElectronPlatform";
import { WebPlatform } from "./WebPlatform";

let platformInstance: PlatformService | null = null;

export const isElectron = (): boolean => {
	return (
		typeof window !== "undefined" &&
		typeof window.require === "function" &&
		window.process &&
		window.process.type === "renderer"
	);
};

export const getPlatformService = (): PlatformService => {
	if (!platformInstance) {
		if (isElectron()) {
			platformInstance = new ElectronPlatform();
		} else {
			platformInstance = new WebPlatform();
		}
	}
	return platformInstance;
};

export default getPlatformService();
