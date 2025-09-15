import { shorthands } from "@/constants";
import { defaultConfig } from "@tamagui/config/v4";
import { createTamagui } from "tamagui";

export const config = createTamagui({
	...defaultConfig,
	shorthands: shorthands,
});

export default config;

export type Conf = typeof config;

declare module "tamagui" {
	interface TamaguiCustomConfig extends Conf {}
}
