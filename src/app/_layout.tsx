import "./global.css";
import { GluestackUIProvider } from "@/ui/gluestack-ui-provider";
import { Stack } from "expo-router";

export default function RootLayout() {
	return (
		<GluestackUIProvider mode="light">
			<Stack>
				<Stack.Screen name="index" options={{ headerShown: false }} />
			</Stack>
		</GluestackUIProvider>
	);
}
