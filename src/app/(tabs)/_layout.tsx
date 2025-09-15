import { Link, Tabs } from "expo-router";
import { Button, useTheme } from "tamagui";
import * as p from "tamagui-phosphor";

export default function TabLayout() {
	const theme = useTheme();

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: theme.red10.val,
				tabBarStyle: {
					backgroundColor: theme.background.val,
					borderTopColor: theme.borderColor.val,
				},
				headerStyle: {
					backgroundColor: theme.background.val,
					borderBottomColor: theme.borderColor.val,
				},
				headerTintColor: theme.color.val,
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Tab One",
					tabBarIcon: ({ color }) => <p.Atom color={color as any} />,
					headerRight: () => (
						<Link href="/modal" asChild>
							<Button mr="$4" size="$2.5">
								Hello!
							</Button>
						</Link>
					),
				}}
			/>
			<Tabs.Screen
				name="songs"
				options={{
					title: "Songs",
					tabBarIcon: ({ color }) => (
						<p.MusicNote color={color as any} />
					),
				}}
			/>
			<Tabs.Screen
				name="two"
				options={{
					title: "Tab Two",
					tabBarIcon: ({ color }) => (
						<p.Waveform color={color as any} />
					),
				}}
			/>
		</Tabs>
	);
}
