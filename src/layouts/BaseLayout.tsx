import { ReactNode } from "react";
import DragWindowRegion from "@components/DragWindowRegion";
import NavigationMenu from "@components/template/NavigationMenu";

export default function BaseLayout({ children }: { children: ReactNode }) {
	return (
		<>
			<DragWindowRegion title="electron-shadcn" />
			<NavigationMenu />
			<main className="h-screen p-2 pb-20">{children}</main>
		</>
	);
}
