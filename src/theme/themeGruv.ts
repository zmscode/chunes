import { createThemes, defaultComponentThemes } from "@tamagui/theme-builder";

const darkPalette = [
	"hsla(0, 0%, 11%, 1)",
	"hsla(0, 0%, 16%, 1)",
	"hsla(0, 0%, 20%, 1)",
	"hsla(0, 0%, 24%, 1)",
	"hsla(0, 0%, 31%, 1)",
	"hsla(0, 0%, 39%, 1)",
	"hsla(0, 0%, 50%, 1)",
	"hsla(20, 18%, 62%, 1)",
	"hsla(39, 23%, 72%, 1)",
	"hsla(36, 36%, 76%, 1)",
	"hsla(34, 44%, 81%, 1)",
	"hsla(32, 49%, 86%, 1)",
];

const lightPalette = [
	"hsla(32, 49%, 86%, 1)",
	"hsla(34, 44%, 81%, 1)",
	"hsla(36, 36%, 76%, 1)",
	"hsla(39, 23%, 72%, 1)",
	"hsla(20, 18%, 62%, 1)",
	"hsla(0, 0%, 50%, 1)",
	"hsla(0, 0%, 39%, 1)",
	"hsla(0, 0%, 31%, 1)",
	"hsla(0, 0%, 24%, 1)",
	"hsla(0, 0%, 20%, 1)",
	"hsla(0, 0%, 16%, 1)",
	"hsla(0, 0%, 11%, 1)",
];

const lightShadows = {
	shadow1: "rgba(60, 56, 54, 0.04)",
	shadow2: "rgba(60, 56, 54, 0.08)",
	shadow3: "rgba(60, 56, 54, 0.16)",
	shadow4: "rgba(60, 56, 54, 0.24)",
	shadow5: "rgba(60, 56, 54, 0.32)",
	shadow6: "rgba(60, 56, 54, 0.4)",
};

const darkShadows = {
	shadow1: "rgba(0, 0, 0, 0.2)",
	shadow2: "rgba(0, 0, 0, 0.3)",
	shadow3: "rgba(0, 0, 0, 0.4)",
	shadow4: "rgba(0, 0, 0, 0.5)",
	shadow5: "rgba(0, 0, 0, 0.6)",
	shadow6: "rgba(0, 0, 0, 0.7)",
};

const gruvboxGreen = {
	green1: "hsla(61, 66%, 44%, 1)",
	green2: "hsla(60, 71%, 35%, 1)",
	green3: "hsla(59, 72%, 27%, 1)",
};

const gruvboxRed = {
	red1: "hsla(6, 96%, 59%, 1)",
	red2: "hsla(2, 74%, 50%, 1)",
	red3: "hsla(358, 68%, 39%, 1)",
};

const gruvboxYellow = {
	yellow1: "hsla(42, 95%, 58%, 1)",
	yellow2: "hsla(40, 73%, 49%, 1)",
	yellow3: "hsla(35, 88%, 32%, 1)",
};

const gruvboxBlue = {
	blue1: "hsla(183, 52%, 47%, 1)",
	blue2: "hsla(177, 42%, 40%, 1)",
	blue3: "hsla(175, 57%, 27%, 1)",
};

const gruvboxPurple = {
	purple1: "hsla(333, 34%, 54%, 1)",
	purple2: "hsla(344, 47%, 44%, 1)",
	purple3: "hsla(341, 50%, 32%, 1)",
};

const builtThemes = createThemes({
	componentThemes: defaultComponentThemes,
	base: {
		palette: {
			dark: darkPalette,
			light: lightPalette,
		},
		extra: {
			light: {
				...gruvboxGreen,
				...gruvboxRed,
				...gruvboxYellow,
				...gruvboxBlue,
				...gruvboxPurple,
				...lightShadows,
				shadowColor: lightShadows.shadow1,
			},
			dark: {
				...gruvboxGreen,
				...gruvboxRed,
				...gruvboxYellow,
				...gruvboxBlue,
				...gruvboxPurple,
				...darkShadows,
				shadowColor: darkShadows.shadow1,
			},
		},
	},
	accent: {
		palette: {
			dark: [
				"hsla(24, 88%, 20%, 1)",
				"hsla(24, 88%, 28%, 1)",
				"hsla(24, 88%, 35%, 1)",
				"hsla(24, 88%, 42%, 1)",
				"hsla(24, 88%, 45%, 1)",
				"hsla(26, 83%, 52%, 1)",
				"hsla(28, 80%, 56%, 1)",
				"hsla(30, 77%, 60%, 1)",
				"hsla(33, 95%, 63%, 1)",
				"hsla(33, 95%, 70%, 1)",
				"hsla(33, 95%, 77%, 1)",
				"hsla(33, 95%, 85%, 1)",
			],
			light: [
				"hsla(33, 95%, 90%, 1)",
				"hsla(33, 95%, 85%, 1)",
				"hsla(33, 95%, 77%, 1)",
				"hsla(33, 95%, 70%, 1)",
				"hsla(33, 95%, 63%, 1)",
				"hsla(30, 77%, 60%, 1)",
				"hsla(28, 80%, 56%, 1)",
				"hsla(26, 83%, 52%, 1)",
				"hsla(24, 88%, 45%, 1)",
				"hsla(24, 88%, 35%, 1)",
				"hsla(24, 88%, 25%, 1)",
				"hsla(24, 88%, 15%, 1)",
			],
		},
	},
	childrenThemes: {
		warning: {
			palette: {
				dark: [
					"hsla(35, 88%, 20%, 1)",
					"hsla(35, 88%, 25%, 1)",
					"hsla(35, 88%, 32%, 1)",
					"hsla(38, 80%, 38%, 1)",
					"hsla(40, 73%, 49%, 1)",
					"hsla(41, 85%, 54%, 1)",
					"hsla(42, 95%, 58%, 1)",
					"hsla(42, 95%, 65%, 1)",
					"hsla(42, 95%, 72%, 1)",
					"hsla(42, 95%, 80%, 1)",
					"hsla(42, 95%, 88%, 1)",
					"hsla(42, 95%, 92%, 1)",
				],
				light: [
					"hsla(42, 95%, 92%, 1)",
					"hsla(42, 95%, 88%, 1)",
					"hsla(42, 95%, 80%, 1)",
					"hsla(42, 95%, 72%, 1)",
					"hsla(42, 95%, 65%, 1)",
					"hsla(42, 95%, 58%, 1)",
					"hsla(41, 85%, 54%, 1)",
					"hsla(40, 73%, 49%, 1)",
					"hsla(38, 80%, 38%, 1)",
					"hsla(35, 88%, 32%, 1)",
					"hsla(35, 88%, 25%, 1)",
					"hsla(35, 88%, 20%, 1)",
				],
			},
		},
		error: {
			palette: {
				dark: [
					"hsla(358, 68%, 20%, 1)",
					"hsla(358, 68%, 28%, 1)",
					"hsla(358, 68%, 39%, 1)",
					"hsla(0, 70%, 45%, 1)",
					"hsla(2, 74%, 50%, 1)",
					"hsla(4, 85%, 55%, 1)",
					"hsla(6, 96%, 59%, 1)",
					"hsla(6, 96%, 65%, 1)",
					"hsla(6, 96%, 72%, 1)",
					"hsla(6, 96%, 80%, 1)",
					"hsla(6, 96%, 88%, 1)",
					"hsla(6, 96%, 92%, 1)",
				],
				light: [
					"hsla(6, 96%, 92%, 1)",
					"hsla(6, 96%, 88%, 1)",
					"hsla(6, 96%, 80%, 1)",
					"hsla(6, 96%, 72%, 1)",
					"hsla(6, 96%, 65%, 1)",
					"hsla(6, 96%, 59%, 1)",
					"hsla(4, 85%, 55%, 1)",
					"hsla(2, 74%, 50%, 1)",
					"hsla(0, 70%, 45%, 1)",
					"hsla(358, 68%, 39%, 1)",
					"hsla(358, 68%, 28%, 1)",
					"hsla(358, 68%, 20%, 1)",
				],
			},
		},
		success: {
			palette: {
				dark: [
					"hsla(59, 72%, 15%, 1)",
					"hsla(59, 72%, 20%, 1)",
					"hsla(59, 72%, 27%, 1)",
					"hsla(60, 71%, 32%, 1)",
					"hsla(60, 71%, 35%, 1)",
					"hsla(61, 66%, 40%, 1)",
					"hsla(61, 66%, 44%, 1)",
					"hsla(61, 66%, 52%, 1)",
					"hsla(61, 66%, 60%, 1)",
					"hsla(61, 66%, 70%, 1)",
					"hsla(61, 66%, 80%, 1)",
					"hsla(61, 66%, 88%, 1)",
				],
				light: [
					"hsla(61, 66%, 88%, 1)",
					"hsla(61, 66%, 80%, 1)",
					"hsla(61, 66%, 70%, 1)",
					"hsla(61, 66%, 60%, 1)",
					"hsla(61, 66%, 52%, 1)",
					"hsla(61, 66%, 44%, 1)",
					"hsla(61, 66%, 40%, 1)",
					"hsla(60, 71%, 35%, 1)",
					"hsla(60, 71%, 32%, 1)",
					"hsla(59, 72%, 27%, 1)",
					"hsla(59, 72%, 20%, 1)",
					"hsla(59, 72%, 15%, 1)",
				],
			},
		},
	},
});

export type Themes = typeof builtThemes;

export const themes: Themes =
	process.env.TAMAGUI_ENVIRONMENT === "client" &&
	process.env.NODE_ENV === "production"
		? ({} as any)
		: (builtThemes as any);
