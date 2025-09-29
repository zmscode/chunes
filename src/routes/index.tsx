import ToggleTheme from "@components/ToggleTheme";
import { useTranslation } from "react-i18next";
import LangToggle from "@components/LangToggle";
import Footer from "@components/template/Footer";
import { SiElectron, SiReact, SiVite } from "@icons-pack/react-simple-icons";
import { createFileRoute } from "@tanstack/react-router";

function HomePage() {
	const { t } = useTranslation();
	const iconSize = 48;

	return (
		<div className="flex h-full flex-col">
			<div className="flex flex-1 flex-col items-center justify-center gap-2">
				<div className="inline-flex gap-2">
					<SiReact size={iconSize} />
					<SiVite size={iconSize} />
					<SiElectron size={iconSize} />
				</div>
				<span>
					<h1 className="font-mono text-4xl font-bold">
						{t("appName")}
					</h1>
					<p
						className="text-muted-foreground text-end text-sm uppercase"
						data-testid="pageTitle"
					>
						{t("titleHomePage")}
					</p>
				</span>
				<LangToggle />
				<ToggleTheme />
			</div>
			<Footer />
		</div>
	);
}

export const Route = createFileRoute("/")({
	component: HomePage,
});
