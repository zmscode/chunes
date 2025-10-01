import { defineConfig } from "vite";
import path from "path";

// https://vitejs.dev/config
export default defineConfig({
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
			"@services": path.resolve(__dirname, "./src/utils/services"),
			"@types": path.resolve(__dirname, "./src/utils/types/types.ts"),
			"@enums": path.resolve(__dirname, "./src/utils/types/enums.ts"),
			"@props": path.resolve(__dirname, "./src/utils/types/props.ts"),
		},
	},
});
