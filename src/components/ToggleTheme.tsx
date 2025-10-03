import { MoonIcon, SunIcon, MonitorIcon } from "@phosphor-icons/react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@components/shadcn/select";
import { setTheme, getCurrentTheme } from "@utils/helpers/theme_helpers";
import { useState, useEffect } from "react";
import { ThemeMode } from "@types";

export default function ToggleTheme() {
	const [theme, setThemeState] = useState<ThemeMode>("system");

	useEffect(() => {
		getCurrentTheme().then(({ local }) => {
			setThemeState(local || "system");
		});
	}, []);

	const handleThemeChange = async (newTheme: ThemeMode) => {
		setThemeState(newTheme);
		await setTheme(newTheme);
	};

	return (
		<Select value={theme} onValueChange={handleThemeChange}>
			<SelectTrigger className="w-[140px]">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="light">
					<div className="flex items-center gap-2">
						<SunIcon className="h-4 w-4" />
						<span>Light</span>
					</div>
				</SelectItem>
				<SelectItem value="dark">
					<div className="flex items-center gap-2">
						<MoonIcon className="h-4 w-4" />
						<span>Dark</span>
					</div>
				</SelectItem>
				<SelectItem value="system">
					<div className="flex items-center gap-2">
						<MonitorIcon className="h-4 w-4" />
						<span>System</span>
					</div>
				</SelectItem>
			</SelectContent>
		</Select>
	);
}
