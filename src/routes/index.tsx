import { createFileRoute, Navigate } from "@tanstack/react-router";

function HomePage() {
	return <Navigate to="/library" />;
}

export const Route = createFileRoute("/")({
	component: HomePage,
});
