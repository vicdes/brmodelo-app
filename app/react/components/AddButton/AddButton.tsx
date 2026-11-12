import SuccessModal, { Type } from "@components/PolyglotModals/SuccessModal";
import React from "react";
import AddMenu from "./AddMenu";

interface AddButtonProps {
	onSelect: (type: Type, value: string[]) => void;
	onOpenChange: (open: boolean) => void;
	selectedValue?: any;
	isEdit: boolean;
}

const AddButton: React.FC<AddButtonProps> = ({
	onSelect,
	onOpenChange,
	selectedValue,
	isEdit,
}) => {
	const [isMenuOpen, setIsMenuOpen] = React.useState(false);
	const containerRef = React.useRef<HTMLDivElement>(null);
	const [isModalOpen, setIsModalOpen] = React.useState(false);
	const [successModalOpen, setSuccessModalOpen] = React.useState(false);
	const [successType, setSuccessType] = React.useState<Type>(Type.workload);

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

	const handleSuccess = (type: Type) => {
		setSuccessType(type === "workload" ? Type.workload : Type.nfr);
		setSuccessModalOpen(true);
	};

	return (
		<div
			ref={containerRef}
			style={{
				width: "100%",
				height: "100%",
			}}
		>
			<SuccessModal
				type={successType}
				open={successModalOpen}
				onClose={() => setSuccessModalOpen(false)}
			/>
			{isMenuOpen ? (
				<>
					<AddMenu
						onSelect={onSelect}
						onModalOpenChange={setIsModalOpen}
						selectedValue={selectedValue}
						openModalSuccess={handleSuccess}
						isEdit={isEdit}
					/>
					<button
						className={`${isEdit ? "edit-button-close" : "add-button-close"}`}
						onClick={() => setIsMenuOpen(false)}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 20 15"
							fill="none"
						>
							{isEdit ? (
								<path
									fill="#0088ff"
									d="M5.05 5.05a.8.8 0 0 0-1.13 1.13L8.87 11.13l-4.95 4.95a.8.8 0 1 0 1.13 1.13L10 12.26l4.95 4.95a.8.8 0 1 0 1.13-1.13l-4.95-4.95 4.95-4.95a.8.8 0 0 0-1.13-1.13L10 10l-4.95-4.95Z"
								/>
							) : (
								<path
									fill="#009980"
									d="M5.05 5.05a.8.8 0 0 0-1.13 1.13L8.87 11.13l-4.95 4.95a.8.8 0 1 0 1.13 1.13L10 12.26l4.95 4.95a.8.8 0 1 0 1.13-1.13l-4.95-4.95 4.95-4.95a.8.8 0 0 0-1.13-1.13L10 10l-4.95-4.95Z"
								/>
							)}
						</svg>
					</button>
				</>
			) : (
				<>
					<button
						className={`${isEdit ? "edit-button-plus" : "add-button-plus"}`}
						onClick={() => setIsMenuOpen(true)}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 20 15"
							fill={`${isEdit ? "#0088ff" : "#009980"}`}
						>
							{isEdit ? (
								<path
									fill="white"
									d="M4.5,15.5H5.56l7.81-7.81L12.31,6.63L4.5,14.44V15.5ZM3,17V13.81L13.38,3.44q0.23-0.23 0.5-0.33T14.43,3T15,3.1t0.5,0.33L16.56,4.5Q16.79,4.73 16.9,5T17,5.55q0,0.3-0.1,0.57t-0.33,0.5L6.19,17H3ZM15.5,5.56L14.44,4.5L15.5,5.56Zm-2.67,1.6L12.31,6.63l1.06,1.06L12.83,7.17Z"
								/>
							) : (
								<path
									fill="white"
									d="M10.8 4.8a.8.8 0 0 0-1.6 0v4.4H4.8a.8.8 0 0 0 0 1.6h4.4v4.4a.8.8 0 0 0 1.6 0v-4.4h4.4a.8.8 0 0 0 0-1.6h-4.4V4.8Z"
								/>
							)}
						</svg>
					</button>
				</>
			)}
		</div>
	);
};

export default AddButton;
