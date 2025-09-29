import * as path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@utils": path.resolve(__dirname, "./src/utils"),
			"@assets": path.resolve(__dirname, "./src/assets"),
			"@components": path.resolve(__dirname, "./src/components"),
			"@helpers": path.resolve(__dirname, "./src/utils/helpers"),
			"@layouts": path.resolve(__dirname, "./src/layouts"),
			"@styles": path.resolve(__dirname, "./src/styles"),
			"@routes": path.resolve(__dirname, "./src/routes"),
			"@hooks": path.resolve(__dirname, "./src/hooks"),
			"@stores": path.resolve(__dirname, "./src/utils/stores"),
			"@types": path.resolve(__dirname, "./src/utils/types/types.ts"),
			"@enums": path.resolve(__dirname, "./src/utils/types/enums.ts"),
			"@props": path.resolve(__dirname, "./src/utils/types/props.ts"),
		},
	},
	test: {
		dir: "./src/tests/unit",
		globals: true,
		environment: "jsdom",
		setupFiles: "./src/tests/unit/setup.ts",
		css: true,
		reporters: ["verbose"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			include: ["src/**/*"],
			exclude: [],
		},
	},
});
