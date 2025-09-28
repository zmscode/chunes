import BaseLayout from "@/layouts/BaseLayout";
import { Outlet, createRootRoute } from "@tanstack/react-router";
/* import { TanStackRouterDevtools } from '@tanstack/react-router-devtools' */

function Root() {
	return (
		<BaseLayout>
			<Outlet />
			{/* <TanStackRouterDevtools /> */}
		</BaseLayout>
	);
}

export const Route = createRootRoute({
	component: Root,
});
