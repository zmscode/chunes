import { exposeThemeContext } from "./theme/theme-context";
import { exposeWindowContext } from "./window/window-context";
import { exposeMusicContext } from "./music/music-context";

export default function exposeContexts() {
	exposeWindowContext();
	exposeThemeContext();
	exposeMusicContext();
}
