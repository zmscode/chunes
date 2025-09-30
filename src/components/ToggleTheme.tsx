import { MoonIcon } from "@phosphor-icons/react";
import { Button } from "@components/shadcn/button";
import { toggleTheme } from "@utils/helpers/theme_helpers";

export default function ToggleTheme() {
	return (
		<Button onClick={toggleTheme} size="icon">
			<MoonIcon size={16} />
		</Button>
	);
}
