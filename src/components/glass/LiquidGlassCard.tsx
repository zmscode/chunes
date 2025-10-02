import { ReactNode } from "react";
import { LiquidGlass } from "liquid-glass-ui";
import { cn } from "@utils/tailwind";

interface LiquidGlassCardProps {
	children: ReactNode;
	className?: string;
	intensity?: number;
	blur?: number;
	onClick?: () => void;
	style?: React.CSSProperties;
}

export function LiquidGlassCard({
	children,
	className,
	intensity = 0.3,
	blur = 10,
	onClick,
	style,
}: LiquidGlassCardProps) {
	return (
		<LiquidGlass
			className={cn("relative", className)}
			intensity={intensity}
			blur={blur}
			style={style}
		>
			<div onClick={onClick}>{children}</div>
		</LiquidGlass>
	);
}
