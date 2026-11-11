import { useNfrModal } from "@components/PolyglotModals/useNfrModal";
import { useWorkloadModal } from "@components/PolyglotModals/useWorkloadModal";
import React from "react";
import { useTranslation } from "react-i18next";

export type Type = "workload" | "nfr";

interface AddMenuProps {
	onSelect: (type: Type, value: string[]) => void;
	onModalOpenChange?: (open: boolean) => void;
	selectedValue?: any;
}

const AddMenu: React.FC<AddMenuProps> = ({
	onSelect,
	onModalOpenChange,
	selectedValue,
}) => {
	const [isOpen, setIsOpen] = React.useState(false);
	const createWorkloadModal = useWorkloadModal(
		setIsOpen,
		selectedValue?.get("workload"),
	);
	const createNfrModal = useNfrModal(setIsOpen, selectedValue?.get("nfr"));

	React.useEffect(() => {
		onModalOpenChange?.(isOpen);
		return () => onModalOpenChange?.(false);
	}, [isOpen, onModalOpenChange]);

	const { t } = useTranslation(["common"]);

	const handleOpenWorkload = () => {
		createWorkloadModal
			.open()
			.then((result) => {
				onSelect("workload", result);
			})
			.catch((reason) => {
				if ((reason as any)?.reason === "cancel") return;
			});
	};

	const handleOpenNfr = () => {
		createNfrModal
			.open()
			.then((result) => {
				onSelect("nfr", result);
			})
			.catch((reason) => {
				if ((reason as any)?.reason === "cancel") return;
			});
	};

	return (
		<>
			<div className="add-button-menu">
				<button onClick={handleOpenWorkload} className="add-menu-item">
					{t("Workload")}
				</button>
				<button onClick={handleOpenNfr} className="add-menu-item">
					{t("Non-functional requirement")}
				</button>
			</div>
		</>
	);
};

export default AddMenu;
