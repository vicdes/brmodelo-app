import React, { useState } from "react";
import AddMenu, { Type } from "./AddMenu";

interface AddButtonProps {
	onSelect: (type: Type, value: string[]) => void;
	onOpenChange: (open: boolean) => void;
	selectedValue?: any;
	isEdit: boolean
}

const AddButton: React.FC<AddButtonProps> = ({
	onSelect,
	onOpenChange,
	selectedValue,
	isEdit
}) => {
	const [isMenuOpen, setIsMenuOpen] = React.useState(false);
	const containerRef = React.useRef<HTMLDivElement>(null);
	const [isModalOpen, setIsModalOpen] = React.useState(false);

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
			style={{
				width: "100%",
				height: "100%",
			}}
		>
			{isMenuOpen ? (
				<>
					<AddMenu
						onSelect={onSelect}
						onModalOpenChange={setIsModalOpen}
						selectedValue={selectedValue}
					/>
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
				<>
					<button
						className={`${isEdit ? "add-button-edit" : "add-button-plus"}`}
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
				</>
			)}
		</div>
	);
};

export default AddButton;
