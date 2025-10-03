import { isMacOS } from "@utils/platform";
import { DragWindowRegionProps } from "@props";

export default function DragWindowRegion({ title }: DragWindowRegionProps) {
	return (
		<div
			className="draglayer w-full absolute top-0 left-0 z-50"
			style={{ height: "24px", backgroundColor: "transparent" }}
		>
			{title && !isMacOS() && (
				<div className="flex flex-1 px-4 py-2 text-xs whitespace-nowrap text-gray-400 select-none">
					{title}
				</div>
			)}
		</div>
	);
}
