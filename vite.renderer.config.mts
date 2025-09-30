import * as path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		tanstackRouter({
			target: "react",
			autoCodeSplitting: true,
		}),
		tailwindcss(),
		react({
			babel: {
				plugins: [["babel-plugin-react-compiler"]],
			},
		}),
	],
	resolve: {
		preserveSymlinks: true,
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
			"@services": path.resolve(__dirname, "./src/services"),
			"@types": path.resolve(__dirname, "./src/utils/types/types.ts"),
			"@enums": path.resolve(__dirname, "./src/utils/types/enums.ts"),
			"@props": path.resolve(__dirname, "./src/utils/types/props.ts"),
		},
	},
});
