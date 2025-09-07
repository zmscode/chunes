import "../../global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { Stack } from "expo-router";

export const RootLayout = () => {
	return (
		<GluestackUIProvider mode="light">
			<Stack>
				<Stack.Screen name="index" options={{ headerShown: false }} />
			</Stack>
		</GluestackUIProvider>
	);
};
