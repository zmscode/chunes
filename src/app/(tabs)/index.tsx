import { ToastControl } from "@/components/CurrentToast";
import { UNKNOWN_ARTIST_IMAGE_URI } from "@/constants/constants";
import { Anchor, H2, Image, Paragraph, XStack, YStack } from "tamagui";
import * as p from "tamagui-phosphor";

export default function TabOneScreen() {
	return (
		<YStack flex={1} ai="center" gap="$8" px="$10" pt="$5" bg="$background">
			<H2>Tamagui + Expo</H2>

			<ToastControl />

			<XStack
				ai="center"
				jc="center"
				flexWrap="wrap"
				gap="$1.5"
				position="absolute"
				b="$8"
			>
				<Paragraph fontSize="$5">Add</Paragraph>

				<Paragraph
					fontSize="$5"
					px="$2"
					py="$1"
					color="$blue10"
					bg="$blue5"
				>
					tamagui.config.ts
				</Paragraph>

				<Paragraph fontSize="$5">to root and follow the</Paragraph>

				<XStack
					ai="center"
					gap="$1.5"
					px="$2"
					py="$1"
					br="$3"
					bg="$green5"
					hoverStyle={{ bg: "$green6" }}
					pressStyle={{ bg: "$green4" }}
				>
					<Anchor
						href="https://tamagui.dev/docs/core/configuration"
						textDecorationLine="none"
						color="$green10"
						fontSize="$5"
					>
						Configuration guide
					</Anchor>
					<p.ArrowSquareOut size="$1" color="$green10" />
				</XStack>

				<Paragraph fontSize="$5" text="center">
					to configure your themes and tokens.
				</Paragraph>
			</XStack>
		</YStack>
	);
}
