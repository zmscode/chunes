// Learn more https://docs.expo.io/guides/customizing-metro
/**
 * @type {import('expo/metro-config').MetroConfig}
 */
const { getDefaultConfig } = require("expo/metro-config");
const { withTamagui } = require("@tamagui/metro-plugin");

const config = getDefaultConfig(__dirname, {
	isCSSEnabled: true,
});

config.resolver.sourceExts.push("mjs");

module.exports = withTamagui(config, {
	components: ["tamagui"],
	config: "./tamagui.config.ts",
	outputCSS: "./tamagui-web.css",
});
