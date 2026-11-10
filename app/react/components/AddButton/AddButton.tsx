import React from "react";
import AddMenu, { Type } from "./AddMenu";

interface AddButtonProps {
	onSelect: (type: Type, value: string[]) => void;
	initialValues: [];
	onOpenChange?: (open: boolean) => void;
	isEditButton?: boolean;
	selectedValue: string[];
}

const AddButton: React.FC<AddButtonProps> = ({
	onSelect,
	initialValues,
	onOpenChange,
	selectedValue,
}) => {
	const [isMenuOpen, setIsMenuOpen] = React.useState(false);
	const containerRef = React.useRef<HTMLDivElement>(null);
	const [isModalOpen, setIsModalOpen] = React.useState(false);

	console.log("selected " + selectedValue)

	const isEditButton =
		initialValues?.length > 0 || selectedValue?.length > 0;

	React.useEffect(() => {
		onOpenChange?.(isMenuOpen);
	}, [isMenuOpen]);

	React.useEffect(() => {
		if (!isMenuOpen || isModalOpen) return;

		const handleOutside = (event: Event) => {
			const inside = containerRef.current?.contains(event.target as Node);
			if (containerRef.current && !inside) {
				setIsMenuOpen(false);
			}
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") setIsMenuOpen(false);
		};

		document.addEventListener("pointerdown", handleOutside, true);
		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("pointerdown", handleOutside, true);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isMenuOpen, isModalOpen]);

	return (
		<div
			ref={containerRef}
			className={`add-button${isMenuOpen ? " open" : ""}`}
			style={{
				position: "relative",
				width: "100%",
				height: "100%",
				zIndex: isMenuOpen ? 30 : 10,
			}}
		>
			{isMenuOpen ? (
				<>
					<div className="add-button-menu">
						<AddMenu
							onSelect={onSelect}
							initialValues={initialValues}
							onModalOpenChange={setIsModalOpen}
							selectedValue={selectedValue}
						/>
					</div>
					<button
						className="add-button-close"
						onClick={() => setIsMenuOpen(false)}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 20 15"
							fill="none"
						>
							<path
								fill="#009980"
								d="M5.05 5.05a.8.8 0 0 0-1.13 1.13L8.87 11.13l-4.95 4.95a.8.8 0 1 0 1.13 1.13L10 12.26l4.95 4.95a.8.8 0 1 0 1.13-1.13l-4.95-4.95 4.95-4.95a.8.8 0 0 0-1.13-1.13L10 10l-4.95-4.95Z"
							/>
						</svg>
					</button>
				</>
			) : (
				<button
					className={`${isEditButton ? "add-button-edit" : "add-button-plus"}`}
					onClick={() => setIsMenuOpen(true)}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 20 15"
						fill="none"
					>
						<path
							fill="white"
							d="M10.8 4.8a.8.8 0 0 0-1.6 0v4.4H4.8a.8.8 0 0 0 0 1.6h4.4v4.4a.8.8 0 0 0 1.6 0v-4.4h4.4a.8.8 0 0 0 0-1.6h-4.4V4.8Z"
						/>
					</svg>
				</button>
			)}
		</div>
	);
};

export default AddButton;
