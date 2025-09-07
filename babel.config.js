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

					alias: {
						"@": "./src",
						"@/components": "./src/components",
						"@/ui": "./src/components/ui",
						"@/assets": "./assets",
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
