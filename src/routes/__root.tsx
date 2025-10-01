import PlayerLayout from "@layouts/PlayerLayout";
import { Outlet, createRootRoute } from "@tanstack/react-router";

function Root() {
	return (
		<PlayerLayout>
			<Outlet />
		</PlayerLayout>
	);
}

export const Route = createRootRoute({
	component: Root,
});
