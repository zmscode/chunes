import { ToastControl } from "@/components/CurrentToast";
import { H2, YStack } from "tamagui";
import * as p from "tamagui-phosphor";

export default function SongsScreen() {
	return (
		<YStack flex={1} ai="center" gap="$8" px="$10" pt="$5" bg="$background">
			<H2>Songs</H2>

			<ToastControl />
		</YStack>
	);
}
