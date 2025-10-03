import { ReactNode } from "react";
import DragWindowRegion from "@components/DragWindowRegion";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
	NavigationMenu as NavigationMenuBase,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	navigationMenuTriggerStyle,
} from "@components/shadcn/navigation-menu";

export default function BaseLayout({ children }: { children: ReactNode }) {
	const { t } = useTranslation();

	return (
		<>
			<DragWindowRegion title="chunes" />

			<NavigationMenuBase className="text-muted-foreground px-2">
				<NavigationMenuList>
					<NavigationMenuItem>
						<NavigationMenuLink
							asChild
							className={navigationMenuTriggerStyle()}
						>
							<Link to="/">{t("titleHomePage")}</Link>
						</NavigationMenuLink>
					</NavigationMenuItem>
				</NavigationMenuList>
			</NavigationMenuBase>

			<main className="h-screen p-2 pb-20">{children}</main>
		</>
	);
}
