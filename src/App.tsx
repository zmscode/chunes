import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { syncThemeWithLocal } from "@helpers/theme_helpers";
import { useTranslation } from "react-i18next";
import { updateAppLanguage } from "@helpers/language_helpers";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "@utils/routes";
import { AudioProvider } from "@services/audio/AudioContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@utils/localization/i18n";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5,
			gcTime: 1000 * 60 * 30,
			retry: 3,
			refetchOnWindowFocus: false,
		},
	},
});

export default function App() {
	const { i18n } = useTranslation();

	useEffect(() => {
		syncThemeWithLocal();
		updateAppLanguage(i18n);
	}, [i18n]);

	return (
		<QueryClientProvider client={queryClient}>
			<AudioProvider>
				<RouterProvider router={router} />
			</AudioProvider>
		</QueryClientProvider>
	);
}

const root = createRoot(document.getElementById("app")!);
root.render(
	<StrictMode>
		<App />
	</StrictMode>
);
