module.exports = function (api) {
	api.cache(true);

	return {
		presets: [
			[
				"babel-preset-expo",
				{
					jsxImportSource: "nativewind",
				},
			],
			"nativewind/babel",
		],

		plugins: [
			[
				"module-resolver",
				{
					root: ["./"],
					extensions: [
						".ios.ts",
						".android.ts",
						".ts",
						".ios.tsx",
						".android.tsx",
						".tsx",
						".jsx",
						".js",
						".json",
					],
					alias: {
						"@": "./src",
						"@/assets": "./assets",
						"@/components": "./src/components",
						"@/utils": "./src/utils",
						"@/styles": "./src/styles",
						"@/stores": "./src/stores",
						"@/hooks": "./src/hooks",
						"@/types": "./src/types/types.ts",
						"@/props": "./src/types/props.ts",
						"@/enums": "./src/types/enums.ts",
						"@/constants": "./src/constants/constants.ts",
						"tailwind.config": "./tailwind.config.js",
					},
				},
			],
			"react-native-reanimated/plugin",
		],
	};
};
