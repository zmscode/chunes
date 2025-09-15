import "../../tamagui-web.css";
import { Provider } from "../components/utility/Provider";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { useTheme } from "tamagui";
import {
	configureReanimatedLogger,
	ReanimatedLogLevel,
} from "react-native-reanimated";
import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "@react-navigation/native";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
	initialRouteName: "(tabs)",
};

configureReanimatedLogger({
	level: ReanimatedLogLevel.warn,
	strict: false,
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const [interLoaded, interError] = useFonts({
		Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
		InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
	});

	useEffect(() => {
		if (interLoaded || interError) {
			SplashScreen.hideAsync();
		}
	}, [interLoaded, interError]);

	if (!interLoaded && !interError) {
		return null;
	}

	return (
		<Providers>
			<RootLayoutNav />
		</Providers>
	);
}

const Providers = ({ children }: { children: React.ReactNode }) => {
	return <Provider>{children}</Provider>;
};

function RootLayoutNav() {
	const colorScheme = useColorScheme();
	const theme = useTheme();
	return (
		<ThemeProvider
			value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
		>
			<StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
			<Stack>
				<Stack.Screen
					name="(tabs)"
					options={{
						headerShown: false,
					}}
				/>

				<Stack.Screen
					name="modal"
					options={{
						title: "Tamagui + Expo",
						presentation: "modal",
						animation: "slide_from_right",
						gestureEnabled: true,
						gestureDirection: "horizontal",
						contentStyle: {
							backgroundColor: theme.background.val,
						},
					}}
				/>
			</Stack>
		</ThemeProvider>
	);
}
