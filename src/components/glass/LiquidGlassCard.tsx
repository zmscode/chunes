import { ReactNode } from "react";
import LiquidGlass from "liquid-glass-react";
import { cn } from "@utils/tailwind";

interface LiquidGlassCardProps {
	children: ReactNode;
	className?: string;
	displacementScale?: number;
	blurAmount?: number;
	saturation?: number;
	aberrationIntensity?: number;
	elasticity?: number;
	cornerRadius?: number;
	padding?: string;
	onClick?: () => void;
	style?: React.CSSProperties;
}

export function LiquidGlassCard({
	children,
	className,
	displacementScale = 40,
	blurAmount = 0.3,
	saturation = 110,
	aberrationIntensity = 1.5,
	elasticity = 0.25,
	cornerRadius = 20,
	padding,
	onClick,
	style,
}: LiquidGlassCardProps) {
	return (
		<LiquidGlass
			displacementScale={displacementScale}
			blurAmount={blurAmount}
			saturation={saturation}
			aberrationIntensity={aberrationIntensity}
			elasticity={elasticity}
			cornerRadius={cornerRadius}
			padding={padding}
			onClick={onClick}
			style={{
				...style,
			}}
			className={cn("relative backdrop-blur-md", className)}
		>
			{children}
		</LiquidGlass>
	);
}
