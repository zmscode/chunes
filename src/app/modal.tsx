import {
	Anchor,
	Paragraph,
	View,
	XStack
	} from "tamagui";

export default function ModalScreen() {
	return (
		<View flex={1} ai="center" jc="center">
			<XStack gap="$2">
				<Paragraph text="center">Made by</Paragraph>
				<Anchor
					color="$blue10"
					href="https://github.com/zmscode"
					target="_blank"
				>
					@zmscode,
				</Anchor>
				<Anchor
					color="$accent10"
					href="https://github.com/tamagui/tamagui"
					target="_blank"
					rel="noreferrer"
				>
					give it a ⭐️
				</Anchor>
			</XStack>
		</View>
	);
}
